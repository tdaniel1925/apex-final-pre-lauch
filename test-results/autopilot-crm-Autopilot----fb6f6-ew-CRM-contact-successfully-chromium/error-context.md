# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "CRM Contacts" [level=1] [ref=e5]
        - paragraph [ref=e6]: Manage your leads and contacts with AI-powered lead scoring
      - link "+ Add Contact" [ref=e7] [cursor=pointer]:
        - /url: /autopilot/crm/contacts/new
    - generic [ref=e10]:
      - generic [ref=e11]: Contact Usage
      - generic [ref=e12]: 0 / 500
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - textbox "Search contacts..." [ref=e18]
          - combobox [ref=e19]:
            - option "All Statuses" [selected]
            - option "New"
            - option "Contacted"
            - option "Qualified"
            - option "Unqualified"
            - option "Nurturing"
            - option "Converted"
            - option "Lost"
          - combobox [ref=e20]:
            - option "Date Added" [selected]
            - option "Lead Score"
            - option "Last Contact"
            - option "Name"
          - button "↓" [ref=e21]
        - generic [ref=e22]: 0 contacts total
      - generic [ref=e24]: No contacts found
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
  - alert [ref=e34]
```