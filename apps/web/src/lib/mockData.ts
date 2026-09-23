import type { Chat } from '@maysi/shared';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function mockChat(title: string, prompt: string, reply: string, ageMs: number): Chat {
  const at = new Date(Date.now() - ageMs).toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: at,
    updatedAt: at,
    messages: [
      { id: crypto.randomUUID(), role: 'user', content: prompt, createdAt: at },
      { id: crypto.randomUUID(), role: 'assistant', content: reply, createdAt: at },
    ],
  };
}

// Placeholder history until on-device storage lands in Phase 3.
export const mockChats: Chat[] = [
  mockChat(
    'Whistler family activities',
    'What are some good family activities in Whistler in August?',
    'Here are some great family-friendly activities in Whistler in August:\n\n1. Peak 2 Peak Gondola – incredible views and family-friendly hiking at the top.\n2. Whistler Mountain Bike Park – trails for all levels, including kids programs.\n3. Lost Lake – swimming, paddleboarding and easy walking trails.',
    20 * MINUTE,
  ),
  mockChat(
    'Help me write an email',
    'Help me write an email to my landlord about a leaking tap.',
    'Sure! Here is a short, polite draft you can adapt…',
    2 * HOUR,
  ),
  mockChat(
    'Compare PHEV SUVs',
    'Compare a few popular plug-in hybrid SUVs available in Australia.',
    'Here is a quick comparison of range, price and boot space…',
    5 * HOUR,
  ),
  mockChat(
    'Meal plan ideas',
    'Create a simple weekly meal plan for a family of four.',
    'Here is a balanced 7-day plan with a shopping list…',
    2 * DAY,
  ),
  mockChat(
    'Explain quantum computing',
    'Explain quantum computing like I am 12.',
    'Imagine a coin spinning in the air – it is not just heads or tails…',
    4 * DAY,
  ),
  mockChat(
    'Birthday party ideas',
    'Birthday party ideas for a 7 year old who loves dinosaurs.',
    'Roar-some! Here are some dinosaur party ideas…',
    6 * DAY,
  ),
  mockChat(
    'Tokyo itinerary',
    'Plan a 5 day itinerary for Tokyo.',
    'Day 1: Asakusa and Senso-ji, then Tokyo Skytree…',
    20 * DAY,
  ),
];
