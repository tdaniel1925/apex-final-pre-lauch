# AI Chat Visual Upgrades

## Issues Identified

1. **Fake Data**: AI showing hardcoded examples (Sarah Johnson, Mike Chen, Emily Rodriguez) instead of real team data
2. **No Visual Charts**: AI giving text-based trees when user asks for charts/diagrams
3. **Poor Understanding**: AI not recognizing requests for visual representations

## Solutions

### 1. Remove Fake Examples from System Prompt
- No hardcoded team member examples
- Always use REAL data from tool responses
- Never fabricate names/numbers

### 2. Add Visual Chart Instructions
Tell AI how to render:
- Line charts (growth over time)
- Bar charts (comparisons)
- Interactive matrix trees (organizational diagrams)

### 3. Improve Intent Recognition
Map user phrases to correct visual tools:
- "show me a chart" → ChartCard component
- "diagram" / "tree" / "visual" → MatrixVisualization component
- "my team in a diagram" → Interactive org chart, NOT text tree

## Implementation Plan

1. Update system prompt with visual component syntax
2. Add examples of when to use ChartCard vs MatrixVisualization
3. Remove any hardcoded example data
4. Test with real user queries

## New AI Capabilities

After upgrade, AI will be able to:
- Generate line charts for growth metrics
- Create bar charts for team comparisons
- Render interactive organizational tree diagrams
- Show real-time stats with proper data
- Respond to "show me..." requests with VISUALS, not text

## User Test Cases

- ✅ "show me my team in a diagram" → Interactive matrix tree
- ✅ "how many people are in my team?" → Real count from database
- ✅ "show me a chart with my team" → Bar chart or tree visualization
- ✅ "train me" → Step-by-step guide (no fake data)
