# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - img "Apex Affinity Group" [ref=e5]
    - generic [ref=e6]:
      - heading "Welcome Back" [level=1] [ref=e7]
      - paragraph [ref=e8]: Sign in to your distributor account
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email
        - textbox "Email" [active] [ref=e13]
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - generic [ref=e16]:
          - textbox "Password" [ref=e17]
          - button "Show" [ref=e18]
      - generic [ref=e19]:
        - generic [ref=e20]:
          - checkbox "Remember me for 180 days" [checked] [ref=e21]
          - generic [ref=e22]: Remember me for 180 days
        - link "Reset password" [ref=e23] [cursor=pointer]:
          - /url: /forgot-password
      - button "Sign In" [ref=e24]
    - paragraph [ref=e26]:
      - text: Don't have an account?
      - link "Join Apex Today" [ref=e27] [cursor=pointer]:
        - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - generic [ref=e36]:
      - text: Compiling
      - generic [ref=e37]:
        - generic [ref=e38]: .
        - generic [ref=e39]: .
        - generic [ref=e40]: .
  - alert [ref=e41]
```