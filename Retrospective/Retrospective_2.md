RETROSPECTIVE 2 (Team 6)
=====================================

The retrospective includes the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 5 `5 vs. 4`
- Total points committed vs. done `31 vs. 18`
- Nr of hours planned vs. spent (as a team) `96h 30m vs. 95h 25m`

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing 
- Code review completed 
- Code present on VCS 
- End-to-End tests performed 

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |     17    |       |      39h    |         39h 55m   |
|  _#KX5_    |     6    |     8   |     8h 30m       |     7h 40m         |
|  _#KX6_    |     8    |    3    |    12h        |        11h 45m      |
|  _#KX7_    |     12    |    5    |      13h 30m      |       14h 05m       |
|  _#KX8_    |      8   |     2   |      9h      |        8h 10m      |
|  _#KX9_    |      12   |    13    |       14h 30m     |     13h 50m         |

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
  - estimate: `average:   1.44 hours` `standard deviation:  0.41 hours`
  - actual: `average:   1.41 hours` `standard deviation:  0.44 hours`
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1= -0.08203$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0.194047$$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated `6h`
  - Total hours spent `6h 10m`
  - Nr of automated unit test cases `21`
  - Coverage (if available) 
- E2E testing:
  - Total hours estimated `9h`
  - Total hours spent `9h`
- Code review 
  - Total hours estimated `2h 30m`
  - Total hours spent `2h 30m`
  

## ASSESSMENT

1. **What caused your errors in estimation? (if any)**
   - As the app's functionality grew, we overlooked the increasing complexity of managing and understanding others' work, which has impacted our ability to maintain consistency.


2. **What lessons did you learn (both positive and negative) in this sprint**
   - We learned that it's important not to schedule too much work in the final days, but to reserve them for minor fixes only.

3. **Which improvement goals set in the previous retrospective were you able to achieve?**
   - We have improved our ability to break down larger tasks into subtasks, taking into account the excessive time estimates identified in the previous retrospective.

4. **Which ones you were not able to achieve? Why?**
   - We were not able to complete the task 2 or 3 days before the demo.

5. **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**
   - Focus on reserving the last days for minor fixes and allocate more tasks for learning new components or features.

6. **One thing you are proud of as a team!**
   - We stay in constant communication for any technical or organizational issues. Additionally, we always support each other with features related to code or clarifications of tasks.
