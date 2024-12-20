RETROSPECTIVE 3 (Team 6)
=====================================

The retrospective includes the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done `4 vs. 4`
- Total points committed vs done `45 vs. 45`
- Nr of hours planned vs spent (as a team) `96h vs. 90h30m`

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed
- SonarQube checks pass

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    24   |    -   |   48h30m   |   46h05m     |
| KX9    |     5   |    13  |   10h30m   |    6h00m     |
| KX19   |    10   |     8  |   12h00m   |   12h00m     |
| KX10   |    13   |    21  |   19h30m   |   22h15m     |
| KX20   |     5   |     3  |    5h30m   |    4h10m     |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation)
  - estimate: `average:   1.58 hours` `standard deviation:  0.41 hours`
  - actual: `average:   1.37 hours` `standard deviation:  0.39 hours`

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1
    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1= -0.0573$$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated `3.30`
  - Total hours spent `3.30`
  - Nr of automated unit test cases `31` 
  - Coverage (if available)
- E2E testing:
  - Total hours estimated `3h`
  - Total hours spent `3h`
- Code review 
  - Total hours estimated `30m` 
  - Total hours spent `30m`
- Technical Debt management:
  - Strategy adopted
    - **`feature` → `dev`**: Features are developed in separate branches (e.g., `feature/feature-name`). When merging into the `dev` branch, **only SonarQube checks are required**. No pull request or review is mandatory at this stage.
    - **`dev` → `main`**: Pull requests to the `main` branch are mandatory every two weeks for releases or demos. These PRs must pass **SonarQube checks** and require **review and approval** from at least one team member before merging.

  - Total hours estimated at sprint planning `4h`
  - Total hours spent `3h55m`
  

## ASSESSMENT

- What caused your errors in estimation (if any)?
  - No major errors were committed during the estimation of new stories. One error that occurred is that we didn’t reconsider old stories (kx9) according to their difficulty, considering the fact that it was a story defined in the previous sprint.
- What lessons did you learn (both positive and negative) in this sprint?
  - We learned that for each task, we should consider and split it into subtasks, including the integration between the backend and frontend, as well as the graphical aspects, which become more complex as we progress in developing KirunaExplorer.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  - We are proud of the fact that, the day before the presentation, almost all stories were completed. Despite this, we still need to anticipate the completion of the stories to allow more time and reduce stress the day before the demo while fixing last-minute problems.
  
- Which ones you were not able to achieve? Why?
  - We still need to be able to have the work done 2 or 3 days before the demo.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - As the next sprint will be the last one for this project, we aim to arrive at the demo with a well-designed and visually pleasing web app, marking our work as complete. We are still very proud of our product and its structure, which makes the app highly user-friendly. Our goal is to make it both easy to use and wonderful to look at!

- One thing you are proud of as a Team!!
  - We are proud of ourselves and our ability to collaborate effectively, always helping each other when needed. From the beginning of the project, we maintained strong communication during our working sessions.
