RETROSPECTIVE (Team 6)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done `4 vs. 4`
- Total points committed vs done `14 vs. 14`
- Nr of hours planned vs spent (as a team) `95h 15m vs. 90h 10m`
  (due to a team member's inability to reach their requested hours)

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed
- SonarQube checks pass with Maintainability, Vulnerabilities, Reliability: Grade A

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    35   |    -   |   65h 55m   |   59h 25m     |
| _#14_  |     6   |     3  |     6h   |    5h     |
| _#11_  |     6   |     3  |   7h 40m   |   6h 40m     |
| _#17_  |     6   |     3  |   5h 55m   |   5h 55m    |
| _#12_  |    12   |     5  |    14h 10m   |     13h 10m    |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |   1h 16m   |   20m    | 
| Actual     |   1h 9m   |   18m    |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = -0.0951$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0.0934 $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated `0h` (we focused on technical debt about previous unit tests)
  - Total hours spent `0h`
  - Nr of automated unit test cases `0`
  - Coverage (if available)
- E2E testing:
  - Total hours estimated `30m`
  - Total hours spent `30m`
- Code review 
  - Total hours estimated `4h 30m` 
  - Total hours spent `3h 55m`
- Technical Debt management:
  - Strategy adopted
    - **`feature` → `dev`**: Features are developed in separate branches (e.g., `feature/feature-name`). When merging into the `dev` branch, **only SonarQube checks are required**. No pull request or review is mandatory at this stage.
    - **`dev` → `main`**: Pull requests to the `main` branch are mandatory every two weeks for releases or demos. These PRs must pass **SonarQube checks** (with Maintainability, Vulnerabilities, Reliability: Grade A) and require **review and approval** from at least one team member before merging.

  - Total hours estimated at sprint planning `12h`
  - Total hours spent `12h`
  

## ASSESSMENT

- What caused your errors in estimation (if any)?
  - We had difficulty understanding the stories in the first version in which they were provided to us, and this led to several revisions of the planning.
  - Some tasks were underestimated mainly in the last story due to unexpected difficulties in interacting with the diagram library 

- What lessons did you learn (both positive and negative) in this sprint?
  - We learned that aiming for quality paid off because we got great feedbacks in the latest version of the application
  - We had less difficulty implementing features compared to the previous sprint thanks to managing technical debt. Clean and well-structured code made it easier to add new functionalities efficiently and reduced the need for workarounds.
  - Communication with external stakeholders was slower than expected, affecting our planning.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  - We exceeded the goal set in the last retrospective thanks to many restyling tasks, delivering a well-designed, visually pleasing, and user-friendly web app. We’re proud of its structure, making it both easy to use and great to look at!
  
- Which ones you were not able to achieve? Why?
 - We were unable to complete the work 2 or 3 days before the demo due to misunderstandings about some user stories, which caused delays in development and required additional clarification and rework.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - For the next sprint, we need to focus more on understanding the challenges one team member is facing in completing their hours and develop measures to improve more their integration into the team 

- One thing you are proud of as a Team!!
  - One thing we're proud of as a team is our ability to keep each other updated. Everyone has a clear understanding of the overall vision for the app, which has helped us stay aligned and work efficiently towards our goals.