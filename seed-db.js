const fs = require('fs');
const path = require('path');
const neo4j = require('neo4j-driver');

// Read and parse .env manually
const envPath = path.resolve('.env');
console.log('Reading .env from:', envPath);
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Error reading .env:', e);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const neo4jUri = env.EXPO_PUBLIC_NEO4J_URI;
const neo4jUser = env.EXPO_PUBLIC_NEO4J_USERNAME;
const neo4jPassword = env.EXPO_PUBLIC_NEO4J_PASSWORD;

async function seed() {
  console.log(`\n--- Seeding Neo4j Database at: ${neo4jUri} ---`);
  if (!neo4jUri) {
    console.error('Neo4j URI is not defined in .env');
    return;
  }
  const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
  const session = driver.session();
  try {
    console.log('1. Clearing existing nodes and relationships...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('2. Creating Skill nodes...');
    const skills = [
      { id: 's_solidity', name: 'Solidity', category: 'blockchain', level: 'intermediate', verified: true },
      { id: 's_react', name: 'React', category: 'frontend', level: 'advanced', verified: true },
      { id: 's_react_native', name: 'React Native', category: 'mobile', level: 'advanced', verified: true },
      { id: 's_reanimated', name: 'Reanimated', category: 'mobile', level: 'intermediate', verified: true },
      { id: 's_neo4j', name: 'Neo4j', category: 'data', level: 'beginner', verified: true },
      { id: 's_ai_prompts', name: 'AI Prompts', category: 'ai', level: 'intermediate', verified: true },
      { id: 's_zk_proofs', name: 'ZK Proofs', category: 'blockchain', level: 'advanced', verified: true },
      { id: 's_typescript', name: 'TypeScript', category: 'frontend', level: 'intermediate', verified: true },
      { id: 's_nodejs', name: 'Node.js', category: 'backend', level: 'advanced', verified: true },
      { id: 's_graphql', name: 'GraphQL', category: 'backend', level: 'intermediate', verified: true }
    ];

    for (const skill of skills) {
      await session.run(
        `CREATE (s:Skill {
          id: $id,
          name: $name,
          category: $category,
          level: $level,
          verified: $verified
        })`,
        skill
      );
    }

    console.log('3. Creating User node...');
    const user = {
      id: 'u1',
      displayName: 'Skill Hacker',
      email: 'demo@skillgraph.io',
      walletBalance: 125050,
      createdAt: new Date().toISOString()
    };
    await session.run(
      `CREATE (u:User {
        id: $id,
        displayName: $displayName,
        email: $email,
        walletBalance: $walletBalance,
        createdAt: $createdAt
      })`,
      user
    );

    console.log('4. Creating user HAS_SKILL relationships (Initial verified skills)...');
    // Starting skills: React, TypeScript, Node.js, GraphQL, Neo4j
    const userSkills = ['s_react', 's_typescript', 's_nodejs', 's_graphql', 's_neo4j'];
    for (const skillId of userSkills) {
      await session.run(
        `MATCH (u:User {id: 'u1'})
         MATCH (s:Skill {id: $skillId})
         CREATE (u)-[:HAS_SKILL {verified: true, createdAt: datetime()}]->(s)`,
        { skillId }
      );
    }

    console.log('5. Creating Course nodes...');
    const courses = [
      {
        id: 'c1',
        title: 'Intro to Solidity Smart Contracts',
        description: 'Learn the fundamentals of writing secure smart contracts on Ethereum.',
        durationMinutes: 15,
        xpReward: 150,
        tokenReward: 500,
        completionRate: 0,
        skillTaughtId: 's_solidity'
      },
      {
        id: 'c2',
        title: 'React Native Reanimated Basics',
        description: 'Master 60fps animations in React Native using Reanimated 3.',
        durationMinutes: 25,
        xpReward: 200,
        tokenReward: 750,
        completionRate: 0,
        skillTaughtId: 's_reanimated'
      },
      {
        id: 'c3',
        title: 'Graph Databases with Neo4j',
        description: 'Understand how to map relationships and query nodes using Cypher.',
        durationMinutes: 40,
        xpReward: 300,
        tokenReward: 1000,
        completionRate: 0,
        skillTaughtId: 's_neo4j'
      },
      {
        id: 'c4',
        title: 'Advanced AI Prompt Engineering',
        description: 'Learn how to construct highly deterministic LLM prompts for production apps.',
        durationMinutes: 20,
        xpReward: 250,
        tokenReward: 800,
        completionRate: 0,
        skillTaughtId: 's_ai_prompts'
      },
      {
        id: 'c5',
        title: 'Zero-Knowledge Proofs in Web3',
        description: 'Implement ZK-SNARKs to verify transactions without revealing data.',
        durationMinutes: 60,
        xpReward: 500,
        tokenReward: 2000,
        completionRate: 0,
        skillTaughtId: 's_zk_proofs'
      }
    ];

    for (const course of courses) {
      await session.run(
        `CREATE (c:Course {
          id: $id,
          title: $title,
          description: $description,
          durationMinutes: $durationMinutes,
          xpReward: $xpReward,
          tokenReward: $tokenReward,
          completionRate: $completionRate
        })`,
        course
      );
      
      // Link Course teaches Skill
      await session.run(
        `MATCH (c:Course {id: $courseId})
         MATCH (s:Skill {id: $skillId})
         CREATE (c)-[:TEACHES]->(s)`,
        { courseId: course.id, skillId: course.skillTaughtId }
      );
    }

    console.log('6. Creating Gig nodes...');
    const gigs = [
      {
        id: 'g1',
        title: 'Build Smart Contract for DeFi App',
        company: 'NeoBank',
        description: 'We need an experienced blockchain developer to build and audit a new staking smart contract for our DeFi protocol.',
        bountyAmount: 150000,
        difficulty: 'advanced',
        estimatedHours: 40,
        deadline: '2026-06-01',
        status: 'open',
        applicantCount: 12,
        requiredSkillIds: ['s_solidity', 's_react']
      },
      {
        id: 'g2',
        title: 'Optimize React Native Animations',
        company: 'FitnessPro',
        description: 'Looking for a React Native expert to profile and fix frame drops in our workout tracking app.',
        bountyAmount: 50000,
        difficulty: 'advanced',
        estimatedHours: 15,
        deadline: '2026-05-20',
        status: 'open',
        applicantCount: 3,
        requiredSkillIds: ['s_reanimated']
      }
    ];

    for (const gig of gigs) {
      await session.run(
        `CREATE (g:Gig {
          id: $id,
          title: $title,
          company: $company,
          description: $description,
          bountyAmount: $bountyAmount,
          difficulty: $difficulty,
          estimatedHours: $estimatedHours,
          deadline: $deadline,
          status: $status,
          applicantCount: $applicantCount
        })`,
        gig
      );

      for (const skillId of gig.requiredSkillIds) {
        await session.run(
          `MATCH (g:Gig {id: $gigId})
           MATCH (s:Skill {id: $skillId})
           CREATE (g)-[:REQUIRES]->(s)`,
          { gigId: gig.id, skillId }
        );
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
