# 🛠️ **Technical Debt Management Strategy**

## Introduction
This document outlines our approach to managing Technical Debt (TD) and maintaining high code quality. We integrate TD management into our sprints, focusing on regular TD repayment, improved code maintainability, and consistent quality for every feature delivered.

---

## ⚙️ **Quality Checks in CI/CD**
We enforce strict quality checks throughout the development cycle to prevent the accumulation of Technical Debt.  
- **SonarQube Integration**:  
  Code is automatically analyzed on every push using GitHub Actions. If the following **quality gates** are not met, the build fails:
  - **Code Coverage**: ≥80% (Backend)
  - **Maintainability, Vulnerabilities, Reliability**: **Grade A** (the highest possible quality level, ensuring the best practices in code quality and security)

- **Branch Workflow**:  
  - **`feature` → `dev`**: Features are developed in separate branches (e.g., `feature/feature-name`). When merging into the `dev` branch, **only SonarQube checks are required**. No pull request or review is mandatory at this stage.
  - **`dev` → `main`**: Pull requests to the `main` branch are mandatory every two weeks for releases or demos. These PRs must pass **SonarQube checks** and require **review and approval** from at least one team member before merging.

---

## 🧹 **Paying Back Technical Debt**
We actively work to resolve Technical Debt with clear goals for each sprint:  
- **Issue Prioritization**:  
  - **Blocker Issues**: Must be resolved immediately within the current sprint.  
  - **High Issues**: Must be resolved within the current sprint.  
  - **Medium Issues**: Should be resolved within the sprint, except in exceptional cases, and must be fixed before a release or demo.  
  - **Minor Issues**: Resolved only if time permits during the sprint, otherwise tracked for future sprints.

- **Refactoring**:  
  We focus on identified code areas that need improvement, such as the document state management and map modularization in Sprint 3, to reduce future debt.

---

## ✅ **New Definition of Done**
A user story is **Done** only if it meets the following criteria:  
- Unit tests pass  
- Code reviewed and approved  
- Code present on VCS  
- End-to-End tests performed  
- SonarQube checks pass  

---

## 🔄 **Continuous Improvement**
To prevent new Technical Debt from accumulating, we commit to:  
- **Sprint Check-ins**: Regular reviews of code quality metrics and TD Quality Gates during retrospectives.  
- **Ownership**: Every team member is responsible for the quality of their own code. Additionally, one team member will be responsible for overseeing the entire **Backend**, and another will oversee the entire **Frontend**, ensuring that the quality standards are met across both areas.

---

By adhering to this strategy, we will keep the codebase clean, maintainable, and secure.
