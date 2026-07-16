// ============================================================
// SkillGraph — Neo4j Graph Database Client
// ============================================================
// Handles secure connection to Neo4j AuraDB and executes 
// the advanced Cypher query for the Skill Gap Recommendation Engine.

import neo4j, { Driver } from 'neo4j-driver';
import { SkillGapResult, Skill, Gig, MicroCourse } from '../types';

const uri = process.env.EXPO_PUBLIC_NEO4J_URI || '';
const user = process.env.EXPO_PUBLIC_NEO4J_USERNAME || '';
const password = process.env.EXPO_PUBLIC_NEO4J_PASSWORD || '';

let driver: Driver | null = null;

/**
 * Initializes the Neo4j driver as a singleton.
 */
export const initNeo4j = (): Driver | null => {
  if (!driver && uri && user && password) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    } catch (error) {
      console.error('[Neo4j] Failed to initialize driver:', error);
    }
  }
  return driver;
};

export const neo4jClient = {
  /**
   * Evaluates the "Skill Gap" between a user and a specific gig.
   * Finds the required skills the user lacks, and recommends micro-courses 
   * that teach those exact missing skills.
   */
  getSkillGap: async (userId: string, gigId: string): Promise<SkillGapResult> => {
    const drv = initNeo4j();
    if (!drv) {
      throw new Error('Neo4j Driver not initialized. Check your .env credentials.');
    }

    const session = drv.session();

    try {
      // The core Skill Gap Recommendation Engine Cypher Query
      const query = `
        // 1. Identify the specific Gig and its required skills
        MATCH (g:Gig {id: $gigId})-[:REQUIRES]->(s:Skill)
        
        // 2. Identify the User
        MATCH (u:User {id: $userId})
        
        // 3. Filter for skills the user DOES NOT have. 
        // This implicitly defines the (User)-[NEEDS]->(Skill) relationship.
        WHERE NOT (u)-[:HAS_SKILL]->(s)
        
        // 4. Find MicroCourses that teach these missing skills: (Course)-[:TEACHES]->(Skill)
        OPTIONAL MATCH (c:Course)-[:TEACHES]->(s)
        
        // 5. Aggregate the missing skills and the recommended courses
        WITH g, u, collect(DISTINCT s) AS missingSkills, collect(DISTINCT c) AS recommendedCourses
        
        // 6. Calculate the overall Match Percentage
        MATCH (g)-[:REQUIRES]->(allSkills:Skill)
        WITH g, missingSkills, recommendedCourses, count(DISTINCT allSkills) AS totalReq, size(missingSkills) AS missingCount
        
        RETURN 
          g AS gig, 
          missingSkills, 
          recommendedCourses,
          CASE 
            WHEN totalReq = 0 THEN 100 
            ELSE toInteger(((totalReq - missingCount) * 100.0) / totalReq) 
          END AS matchPercentage
      `;

      const result = await session.run(query, { userId, gigId });

      if (result.records.length === 0) {
        throw new Error('Could not compute skill gap. Either the Gig or User does not exist.');
      }

      const record = result.records[0];

      // Extract node properties and map to TypeScript interfaces
      const gigNode = record.get('gig').properties as Gig;
      
      const missingSkillsNodes = record.get('missingSkills')
        .map((node: any) => node.properties) as Skill[];
        
      const recommendedCoursesNodes = record.get('recommendedCourses')
        .filter((node: any) => node !== null)
        .map((node: any) => node.properties) as MicroCourse[];
        
      const matchPercentage = record.get('matchPercentage').toNumber();

      return {
        gig: gigNode,
        missingSkills: missingSkillsNodes,
        recommendedCourses: recommendedCoursesNodes,
        matchPercentage,
      };

    } catch (error) {
      console.error('[Neo4j] Cypher query error:', error);
      throw new Error('Failed to analyze skill gap. Please ensure database is reachable.');
    } finally {
      await session.close();
    }
  },
  
  /**
   * Mutates the graph: Creates a verified HAS_SKILL relationship between a user and a skill.
   */
  addSkillNode: async (userId: string, skillId: string): Promise<boolean> => {
    const drv = initNeo4j();
    if (!drv) {
      throw new Error('Neo4j Driver not initialized.');
    }

    const session = drv.session();
    try {
      const query = `
        MATCH (u:User {id: $userId})
        MATCH (s:Skill {id: $skillId})
        MERGE (u)-[r:HAS_SKILL]->(s)
        ON CREATE SET r.verified = true, r.createdAt = datetime()
        RETURN r
      `;
      
      const result = await session.run(query, { userId, skillId });
      return result.records.length > 0;
    } catch (error) {
      console.error('[Neo4j] Cypher mutation error:', error);
      throw new Error('Failed to mutate graph.');
    } finally {
      await session.close();
    }
  },

  /**
   * Fetches all verified skills for a specific user from Neo4j.
   */
  getUserSkills: async (userId: string): Promise<Skill[]> => {
    const drv = initNeo4j();
    if (!drv) {
      throw new Error('Neo4j Driver not initialized.');
    }

    const session = drv.session();
    try {
      const query = `
        MATCH (u:User {id: $userId})-[r:HAS_SKILL]->(s:Skill)
        RETURN s
      `;
      const result = await session.run(query, { userId });
      return result.records.map(record => record.get('s').properties as Skill);
    } catch (error) {
      console.error('[Neo4j] Error fetching user skills:', error);
      throw new Error('Failed to fetch user skills.');
    } finally {
      await session.close();
    }
  },

  getAllGigsWithGap: async (userId: string): Promise<Array<{ gig: Gig; missing: Skill[]; matchPercentage: number }>> => {
    const drv = initNeo4j();
    if (!drv) {
      throw new Error('Neo4j Driver not initialized.');
    }

    const session = drv.session();
    try {
      const query = `
        MATCH (g:Gig)
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (g)-[:REQUIRES]->(s:Skill)
        WITH g, u, collect(DISTINCT s) AS allSkills
        WITH g, allSkills, [sk IN allSkills WHERE NOT (u)-[:HAS_SKILL]->(sk)] AS missingSkills
        RETURN g AS gig, allSkills AS requiredSkills, missingSkills,
          CASE 
            WHEN size(allSkills) = 0 THEN 100 
            ELSE toInteger(((size(allSkills) - size(missingSkills)) * 100.0) / size(allSkills)) 
          END AS matchPercentage
      `;
      const result = await session.run(query, { userId });
      return result.records.map(record => {
        const gigNode = record.get('gig').properties as Gig;
        const requiredSkills = record.get('requiredSkills')
          .filter((node: any) => node !== null)
          .map((node: any) => node.properties) as Skill[];
        const missingNodes = record.get('missingSkills')
          .filter((node: any) => node !== null)
          .map((node: any) => node.properties) as Skill[];
        const matchPercentage = record.get('matchPercentage').toNumber();
        
        // Attach required skills so components can map over them
        gigNode.requiredSkills = requiredSkills;

        return {
          gig: gigNode,
          missing: missingNodes,
          matchPercentage
        };
      });
    } catch (error) {
      console.error('[Neo4j] Error fetching gigs with gap:', error);
      throw new Error('Failed to fetch gigs with gap.');
    } finally {
      await session.close();
    }
  },
  
  /**
   * Safely closes the Neo4j driver connection.
   */
  close: async () => {
    if (driver) {
      await driver.close();
      driver = null;
    }
  }
};
