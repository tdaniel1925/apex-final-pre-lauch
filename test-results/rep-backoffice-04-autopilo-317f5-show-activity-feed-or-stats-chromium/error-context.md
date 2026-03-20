# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - heading "Downline Activity" [level=1] [ref=e5]
      - paragraph [ref=e6]: Stay updated with your team's activities and achievements
    - generic [ref=e7]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - img [ref=e11]
          - generic [ref=e13]: "Filter:"
        - combobox [ref=e14]:
          - option "All Activities" [selected]
          - option "New Signups"
          - option "Sales"
          - option "Rank Advancements"
          - option "Training Completed"
        - combobox [ref=e15]:
          - option "Last 7 days"
          - option "Last 30 days" [selected]
          - option "Last 60 days"
          - option "Last 90 days"
      - generic [ref=e16]:
        - img [ref=e17]
        - paragraph [ref=e20]: No activity found
        - paragraph [ref=e21]: Activities from your downline will appear here
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
```