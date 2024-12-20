RETROSPECTIVE 1 (Team 6)
=====================================

The retrospective include the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done `4 vs. 4`
- Total points committed vs. done `18 vs. 18`
- Nr of hours planned vs. spent (as a team) `97h vs. 96h 43m`

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    14    |       |     73h 30m       |      71h 45m      |
| _#KX1_   |    11     |   3    |    49h       |       50h 40m       |
| _#KX2_   |    13     |   2    |    48h 30m       |       49h 05m       |
| _#KX3_   |     9    |    8   |      28h 30m     |       28h 30m
| _#KX4_   |      6    |    5     |     25h 30m       |    24h 33m    
   

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
  - estimate: `average: 4.17 hours` `standard deviation: 0.78 hours`
  - actual: `average: 3.83 hours` `standard deviation: 0.55 hours`
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.011 $$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0.020 $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: `6h`
  - Total hours spent: `6h`
  - Nr of automated unit test cases: `36 tests`
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: `1h`
  - Total hours spent: `1h 10m`
- Code review 
  - Total hours estimated: `2h`
  - Total hours spent: `2h`
  


## ASSESSMENT

1. **What caused your errors in estimation? (if any)**
   - As we clearly defined our tasks into very small subtasks according to our experience from last project, we dont have significant errors in estimation.


2. **What lessons did you learn (both positive and negative) in this sprint**
   - We learned that clients are not always clear and sure about what they want, so we need to be prepared for changes.

3. **Which improvement goals set in the previous retrospective were you able to achieve?**
   - We defined all the work from the beginning of the sprint, we divided all our task into small subtasks and we did a good prioritisation in doing the tasks.


4. **Which ones you were not able to achieve? Why?**
   - As we defined our work in a clear way, we were able to achieve them all.

5. **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**
   - Putting more attention on UI because stakeholders are interested in that.

6. **One thing you are proud of as a team!**
   - We are proud of our very well communication, perfect team organisation, clear roles and responsibility definitions and also helping each other at times needed.
