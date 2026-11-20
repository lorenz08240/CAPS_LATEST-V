---
name: eval
description: Executes autonomous user flow simulation, testing, and UX audits against the official updated Pateros Technological College (PTC-IICT) ISO/IEC 25010 Software Quality Evaluation Instrument. Simulates realistic student client personas (rotating names, Grade 11 CSS / BSIT strands), IT specialists, or faculty evaluators, captures visual telemetry via headless Chrome CDP, scores using the official 5-point Likert scale across Part II (General: 17 criteria) and Part III (Technical: 9 criteria), identifies usability friction, and provides actionable recommendations. Triggered whenever the user types /eval or asks to test, audit, evaluate, or review a user flow or screen.
---

# /eval: Official PTC-IICT ISO/IEC 25010 Software Quality Evaluation

Conducts rigorous, automated end-to-end evaluations of the BuildLab platform using the newly shared official evaluation instrument from the **Institute of Information and Computing Technology, Pateros Technological College**.

**Official System Title**:
> *BUILDLAB: AN EXPERT SYSTEM FOR VIRTUAL PC ASSEMBLY FEATURING A DIGITAL COMPONENT PICKER, 2D/3D HARDWARE SIMULATION, AND INTERACTIVE LEARNING MODULES*

**Drive Document Reference**:
- Document Name: `BuildLab ISO/IEC 25010 Evaluation Form`
- Google Drive File ID: `1OZ9a3S9HZK4RYtsOsw9jBfpH2PkUMPU7Tcj7lnG-rEo`
- Owner: `spol@paterostechnologicalcollege.edu.ph`

---

## 🏛️ Official Institutional Instrument Reference

```
PATEROS TECHNOLOGICAL COLLEGE
INSTITUTE OF INFORMATION AND COMPUTING TECHNOLOGY
Bachelor of Science in Information Technology
College St., Sto. Rosario Kanluran, Pateros, Metro Manila
```

### Official 5-Point Likert Rating Scale & Verbal Interpretation

| Numerical Rating | Rating Interval | Verbal Interpretation | Description |
| :---: | :---: | :--- | :--- |
| **5** | **4.21 – 5.00** | **Excellent** | The feature or quality standard is fully met and performs exceptionally well. (*Napakahusay*) |
| **4** | **3.41 – 4.20** | **Very Good** | The feature or quality standard is met with high effectiveness and minimal issues. (*Mahusay*) |
| **3** | **2.61 – 3.40** | **Good** | The feature or quality standard is acceptable and functions as expected. (*Katanggap-tanggap*) |
| **2** | **1.81 – 2.60** | **Fair** | The feature or quality standard is partially met with noticeable limitations. (*Kailangan ng pagpapabuti*) |
| **1** | **1.00 – 1.80** | **Poor** | The feature or quality standard is missing, inaccurate, or non-functional. (*Hindi maayos o kulang*) |

---

## 👤 Part I: Respondent Profile Engine

Whenever `/eval` is invoked, rotate realistic respondent profiles. Do not reuse the same name or profile consecutively.

### Respondent Classifications
1. **Senior High School Student — Grade and Strand**:
   - Grade 11 / Grade 12 TVL - Computer Systems Servicing (CSS)
   - Grade 11 / Grade 12 STEM / ICT Strand
   - 1st Year / 2nd Year BS Information Technology (BSIT)
   *(Note: Students evaluate Part II only and skip Part III Technical Evaluation)*
2. **Faculty / ICT Instructor — Subject / Department**:
   - PTC-IICT Hardware / CSS Instructors, Laboratory Custodians, DepEd TVL-CSS Teachers.
   *(Evaluates both Part II and Part III)*
3. **IT Professional / Hardware Specialist — Job Title / Years of Experience**:
   - Lead Systems Integrators, PC Bench Technicians, Network/Hardware Engineers (3–10+ years experience).
   *(Evaluates both Part II and Part III)*

### Rotating Personas Pool

| Persona | Classification & Profile | Background & Goals | Friction Triggers |
| :--- | :--- | :--- | :--- |
| **Chloe Ramirez (19)** | Senior High School Student: Grade 12 TVL-CSS | Novice. Uses laptop for Google Docs and YouTube; never assembled a physical desktop PC. Wants to complete CSS pre-lab modules safely. | Intimidated by complex engineering telemetry, tiny fonts, or lack of safety warnings. |
| **Noah Santos (18)** | Senior High School Student: Grade 11 TVL-CSS | Novice builder. Familiar with graphics cards for gaming, but confused by socket keys and PCIe slot generations. Preparing for TESDA NC II assessment. | Needs explicit visual alignment cues, physical pinout guidance, and feedback on wrong moves. |
| **Engr. Marcus Reyes (32)** | IT Professional: Lead Systems Integrator (8 Years Exp) | 8 years building commercial rigs, CompTIA A+ & Network+ certified. Evaluates compatibility precision, PSU headroom, and thermal pressure physics. | Unforgiving of incorrect wattage math, wrong RAM slot advice (A2/B2), or clearance oversights. |
| **Prof. Maria Elena Cruz (44)** | Faculty: CSS Lab Instructor (12 Years Exp) | 12 years teaching Computer Systems Servicing NC II at PTC-IICT. Evaluates DepEd/TESDA syllabus alignment, student quiz validity, and certification standards. | Critical of factual inaccuracies, lack of lab safety callouts, or bypassable learning gates. |
| **Liam Torres (19)** | Senior High School Student: 1st Year BSIT | Creative student wanting to build a workstation for 3D rendering and software dev. Cares about UI contrast, clarity, and theme comfort. | Sensitive to harsh glare, cluttered viewports, and confusing technical abbreviations. |
| **Arvin Dizon (29)** | IT Professional: Hardware Specialist & Bench Tech (6 Years Exp) | Bench technician and custom liquid cooling specialist. Audits component catalog accuracy, socket filters, and administrative inventory modifiability. | Critical of unverified specs, sluggish 3D asset draw calls, or broken admin portals. |

---

## 📋 Part II: System Evaluation (For ALL Respondents: Students, Faculty, IT Professionals)

Part II covers **17 criteria and indicators** across 5 ISO 25010 characteristics:

### A. Functional Suitability
1. **Functional Completeness**: BuildLab provides all necessary tools to select parts, check compatibility, simulate 2D/3D assembly, learn PC building lessons, and export a build summary.  
   *(Kumpleto ang features ng BuildLab—pwede kang pumili ng parts, mag-check ng compatibility, mag-simulate ng 2D/3D assembly, matuto sa lessons, at mag-export ng build summary.)*
2. **Functional Correctness**: The expert compatibility engine accurately detects CPU socket mismatches, RAM generation conflicts, storage interface issues, and insufficient PSU wattage.  
   *(Tama ang pag-detect ng compatibility engine kapag hindi tugma ang CPU socket, RAM type, storage interface, o kapag kulang ang wattage ng PSU.)*

### B. Performance Efficiency
1. **Time Behavior**: The 2D/3D simulation canvas, component catalog, and real-time compatibility alerts respond quickly without long loading delays.  
   *(Mabilis mag-load ang 2D/3D simulation canvas, listahan ng parts, at compatibility alerts—walang matagal na loading.)*
2. **Resource Utilization**: The web application runs smoothly on standard school computers or personal devices without causing severe browser lag or overheating.  
   *(Smooth gamitin ang web app sa regular na computer o device nang hindi sobrang nagla-lag o nag-o-overheat.)*
3. **Capacity**: The system handles full PC configurations, multiple component swaps, and build comparisons smoothly without slowing down.  
   *(Kaya ng system ang buong PC build, paulit-ulit na pagpapalit ng parts, at pag-compare ng builds nang hindi bumabagal.)*

### C. Compatibility
1. **Co-existence**: BuildLab operates properly alongside other open browser tabs and applications without interfering with device performance.  
   *(Maayos pa ring gumagana ang BuildLab kahit may iba pang nakabukas na browser tabs o apps sa device.)*
2. **Interoperability**: The generated technical manifest / printable build summary exports cleanly and displays accurate specifications across devices.  
   *(Malinis na nae-export at tama ang specs na lumalabas sa printable technical manifest o build summary kahit saang device tingnan.)*

### D. Usability
1. **Appropriateness Recognizability**: First-time users immediately understand the purpose of BuildLab and how to start configuring or learning PC assembly.  
   *(Gets agad ng first-time users kung para saan ang BuildLab at kung paano magsimulang mag-assemble o mag-aral.)*
2. **Learnability**: The BuildLab Quick Course (4-module, 12-lesson curriculum with video demos and quizzes) effectively teaches beginners how to assemble a PC.  
   *(Malaking tulong ang BuildLab Quick Course (mga lessons, video demos, at quizzes) para matutong mag-assemble ng PC ang mga beginners.)*
3. **Operability**: Navigating between the Digital Component Picker, 2D/3D Simulation Canvas, Comparison Engine, and Learning Modules is simple and intuitive.  
   *(Madaling gamitin at paglipat-lipatan ang Digital Component Picker, 2D/3D Simulation Canvas, Comparison Engine, at Learning Modules.)*
4. **User Error Protection**: Clear conflict alerts and assembly guidance prevent users from finalizing incompatible hardware combinations or wrong part placements.  
   *(Nakakatulong ang malinaw na conflict alerts at guides para maiwasan ang maling pagkakabit o pagpili ng hindi compatible na parts.)*
5. **User Interface Aesthetics**: The screen layout, 3D hardware models, color contrast, and visual icons are clean, organized, and pleasant to use.  
   *(Malinis, maayos, at maganda sa mata ang layout ng screen, mga 3D hardware models, at icons.)*
6. **Accessibility**: Text labels, conflict warnings, video controls, and screen layouts adjust properly across different screen sizes and resolutions.  
   *(Malinaw basahin ang mga labels at warnings, at maayos nag-a-adjust ang screen layout sa iba't ibang screen sizes.)*

### E. Reliability
1. **Maturity**: BuildLab runs consistently without freezing, blank screens, or 3D rendering crashes during normal assembly and quiz sessions.  
   *(Stable gamitin ang BuildLab—hindi nagfi-freeze, nagba-blank screen, o nagka-crash ang 3D simulation habang ginagamit.)*
2. **Availability**: The web platform and its learning resources are readily accessible whenever opened through an active internet connection.  
   *(Agad nabubuksan at nagagamit ang web platform at mga lessons basta may internet connection.)*
3. **Fault Tolerance**: The system handles rapid clicking, invalid part selections, or unexpected user inputs gracefully without breaking the interface.  
   *(Hindi nasisira ang interface kahit sunod-sunod ang pag-click o maling parts ang mapili ng user.)*
4. **Recoverability**: Local course quiz progress and active build configurations are properly retained or easily restored if the page is refreshed.  
   *(Naka-save pa rin o madaling maibalik ang quiz progress at current PC build kahit ma-refresh ang browser.)*

---

## 🛠️ Part III: Technical Evaluation (FOR IT PROFESSIONALS AND FACULTY ONLY)

*Note: Students skip Part III. Faculty and IT Specialists evaluate all 9 criteria below:*

### F. Security
1. **Confidentiality**: Administrative controls, database management utilities, and web-crawling tools are strictly restricted behind authenticated admin login credentials.  
   *(Protektado ng admin login ang admin controls, database tools, at web crawler kaya authorized admin lang ang pwedeng mag-access.)*
2. **Integrity**: Public users can interact with the simulation freely without being able to alter or corrupt the central hardware knowledge base.  
   *(Malayang nagagamit ng public users ang simulation nang hindi nila nababago o nasisira ang central hardware database.)*
3. **Authenticity**: Admin session authentication verifies authorized access before allowing updates to component and specifications.  
   *(Tsine-check muna ng admin authentication kung authorized ang user bago payagang mag-update ng component details.)*

### G. Maintainability
1. **Modularity**: The separation of the inference engine, 2D/3D simulation canvas, component picker, and learning modules allows isolated updates without breaking other features.  
   *(Dahil magkakahiwalay ang inference engine, 2D/3D canvas, component picker, at learning modules, mas madaling mag-update nang hindi nadadamay ang ibang parts.)*
2. **Analyzability & Modifiability**: The automated web crawler and admin inventory gateway allow administrators to easily inspect, add, or update hardware specifications and prices summary.  
   *(Mas pinapadali ng automated web crawler at admin inventory gateway ang pag-check, pagdagdag, at pag-update ng specs at prices ng hardware.)*
3. **Testability**: Compatibility rules (sockets, RAM types, PCIe, wattage) and quiz logic can be systematically verified and validated for accuracy.  
   *(Mas madaling i-check at i-verify ang accuracy ng compatibility rules at quiz logic ng system.)*

### H. Portability
1. **Adaptability**: As a responsive web-based platform, BuildLab adapts smoothly across desktop computers, laptops, tablets and different operating systems (Windows, macOS, Linux).  
   *(Maayos nag-a-adjust ang BuildLab sa iba't ibang desktop, laptop, tablet, at operating systems gaya ng Windows, macOS, at Linux.)*
2. **Installability (Zero-Install Access)**: Users can launch and operate the platform directly through modern web browsers without requiring complex local software installation.  
   *(Direktang nabubuksan at nagagamit ang platform sa browser nang hindi na kailangang mag-install ng mabibigat na software.)*
3. **Replaceability**: BuildLab effectively serves as a digital alternative or supplement to physical PC hardware laboratories in resource-constrained ICT classrooms.  
   *(Magandang digital alternative o dagdag na gamit ang BuildLab sa mga ICT classrooms na kulang sa actual PC hardware.)*

---

## 🔬 Evaluation Execution Protocol

1. **Active Environment Verification**:
   - Ensure the frontend preview/dev server is running (e.g. `http://localhost:5173` or `http://localhost:5174`). If offline, bring it up.
2. **Headless Chrome CDP Telemetry**:
   - Execute an autonomous script using Chrome DevTools Protocol at standard student resolution ($1366 \times 768$) and standard desktop ($1440 \times 900$).
   - Test the specific flow or route requested (e.g. `/learn`, `/build`, `/compatibility`, `/3d-builder`, `/admin`).
   - Capture telemetry screenshots at each critical stage:
     - First-time landing & onboarding tour
     - Interactive hardware stage, 3D controls & video player
     - Knowledge checks, validation logic, and quiz locking
     - Popovers, drawers, and responsive resizing
     - Theme toggling (Titanium Dark Studio vs. Cream Light Studio)
3. **Scoring & Qualitative Analysis**:
   - Assign quantitative scores (1 to 5) to each relevant criteria item based on real telemetry evidence.
   - For Students: Calculate mean scores for Characteristics A–E and the Part II composite mean.
   - For Faculty / IT Specialists: Calculate mean scores for Characteristics A–E (Part II), Characteristics F–H (Part III), and the Overall 26-item composite mean.
4. **Identify Usability Friction & Deficiencies**:
   - Highlight exact CSS/JS bugs, contrast issues, or broken interaction states.
5. **Actionable Improvement Recommendations**:
   - Categorize into Immediate Fixes and Quality Enhancements.

---

## 📑 Required Output Report Structure

Every `/eval` report written to the artifacts directory must follow this exact layout:

1. **Header & Metadata**:
   - Institutional Title: Pateros Technological College — Institute of Information and Computing Technology
   - System Title: BUILDLAB: AN EXPERT SYSTEM FOR VIRTUAL PC ASSEMBLY FEATURING A DIGITAL COMPONENT PICKER, 2D/3D HARDWARE SIMULATION, AND INTERACTIVE LEARNING MODULES
   - Date & Time of Evaluation
   - Instrument Reference: Google Drive Form `1OZ9a3S9HZK4RYtsOsw9jBfpH2PkUMPU7Tcj7lnG-rEo`
2. **Part I: Respondent Profile**:
   - Name, Date, School/Institution, Respondent Classification (Student / Faculty / IT Specialist).
3. **User Flow & In-Character Narrative**:
   - Step-by-step user journey with chronological telemetry screenshots and direct student/specialist quotes.
4. **Part II: System Evaluation Table (17 Criteria)**:
   - Complete table containing Characteristics A–E, scores (1–5), verbal interpretations (Excellent, Very Good, Good, Fair, Poor), and telemetry evidence findings.
   - Part II Mean Score.
5. **Part III: Technical Evaluation Table (9 Criteria)**:
   - For Faculty / IT Specialists: Characteristics F–H scored (1–5) with evidence.
   - For Students: Explicitly noted as *(Skipped — Student Respondent)*.
   - Part III Mean Score and Overall 26-Criterion Composite Mean.
6. **Deficiencies, Usability Friction & Bug Log**:
   - Concrete items observed with severity (High / Medium / Low).
7. **Prioritized Action Plan**:
   - Immediate fixes ready for implementation before survey rollout.
