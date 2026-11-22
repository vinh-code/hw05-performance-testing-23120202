# AI Audit Report — HW05 Performance Testing

## 1. Student Information

| Field | Value |
|---|---|
| Student name (printed) | Phạm Quang Vinh |
| Student ID | 23120202 |
| Class / Cohort | CQ2023/31 |
| Assignment ID | HW05-AI — Performance Testing |
| Assignment date / deadline | 23 November 2026, 13:00 (Asia/Ho_Chi_Minh) |
| AI tool(s) used | OpenAI Codex |
| AI used | Yes |
| Course | CS423 / CSC13003 — Software Testing |
| Lecturers & TAs | Dr. Lam Quang Vu; Dr. Tran Duy Hoang; MSc. Tran Thi Bich Hanh; MSc. Truong Phuoc Loc; MSc. Ho Tuan Thanh |

## 2. Audit Method

This report declares: **I use AI tools for the following tasks.** One entry is recorded per AI-assisted artifact rather than per short clarification message. Prompts are copied verbatim from the Codex session. Because source files such as a JMeter plan are the AI output itself, the complete verbatim output is attached at the stated repository path; an exact excerpt is reproduced below to make each entry reviewable. Real JTL measurements, screenshots, machine specifications, the public links, and the student's signature are execution evidence rather than AI-generated evidence.

Verdicts use the template definitions:

- **VALID** — correct and accepted without a substantive correction.
- **INVALID** — the generated artifact was wrong or unsafe to use until replaced.
- **INCOMPLETE** — useful, but accepted only after human review and correction.

## 3. Audit Table — One Entry per Artifact

### Artifact #1 — Assignment interpretation and workflow selection

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 22:26, 17 November 2026
- Verbatim prompt: `hãy đọc đề và giải thích đề sau đó gợi ý workflow giúp tôi 1 2 có người chọn r`

**AI Output**

Verbatim excerpt:

> Mình khuyên bạn chọn **Flow 4 – Cập nhật hồ sơ → Mua**. Trong ba flow còn lại, đây là lựa chọn cân bằng nhất: đủ Auth–Read–Transactional, dễ tạo dữ liệu CSV và ít rủi ro hơn Flow 3 hoặc Flow 5.

The resulting workflow is recorded in `README.md` and `docs/test-design.md` as:

`Login → Get profile → Update profile → Search products → Product detail → Add to cart → Checkout → Order detail`

**Verdict:** VALID

**Reasoning**

The workflow covers the three endpoint groups required by HW05 §5 and §6: auth-heavy, read-heavy, and transactional. The selected sequence also preserves an end-to-end business transaction instead of testing unrelated endpoints.

**Student Fix**

No technical correction was required. The student confirmed that the workflow was available in the group's allocation and later requested that the presentation describe the actions directly instead of repeatedly calling it “Workflow 4.”

---

### Artifact #2 — Test design and scenario parameters

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 23:17, 17 November 2026
- Verbatim prompt: `ok bắt đầu làm giúp tôi`

**AI Output**

Complete output: `docs/test-design.md`.

Verbatim excerpt:

> Đánh giá backend EShop dưới tải bình thường, tải tăng đến giới hạn và tải tăng đột ngột bằng cùng một workflow end-to-end.

The first design proposed Load 20 users, Stress 60 users, and a Spike baseline of 5 plus a burst of 80 users.

**Verdict:** INCOMPLETE

**Reasoning**

The structure matched HW05 §6, but the user counts were only hypotheses and could not establish the machine's stress or endurance threshold. Performance levels must be calibrated using observed latency, throughput, errors, and resources, not accepted solely because an AI proposed them.

**Student Fix**

The student retained 20 users for Load, then required measured calibration at **200, 500, and 1,000 users**. The final Spike became **baseline 20 + burst 1,000**, and endurance was tested at **800, 500, and 300 users**. The report calls 300 users the **highest verified stable tested level**, not an absolute maximum.

---

### Artifact #3 — CSV test dataset

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 23:17, 17 November 2026
- Verbatim prompt: `ok bắt đầu làm giúp tôi`

**AI Output**

Complete outputs: `test-data/users.csv`, `scripts/generate_test_data.mjs`, and `scripts/seed_test_users.sh`.

Verbatim CSV excerpt:

```csv
email,password,name,phone,address,keyword
perf0001@example.test,Test1234!,Perf User 0001,0910000001,0001 Nguyen Van Cu District 1 HCMC,iPhone
```

**Verdict:** INCOMPLETE

**Reasoning**

HW05 §6 requires data-driven requests. Apache JMeter's CSV Data Set Config reads records into variables and can assign different input rows to threads. However, the business flow updates a profile and cart, so changing identity between loop iterations or sharing one account could introduce contention that is not representative of the intended virtual user.

**Student Fix**

The dataset was expanded to **1,100 separate accounts** for the largest run. A Once Only Controller pins the assigned CSV fields into `vu_*` variables so one virtual user keeps the same identity. The seed script was made repeatable by attempting login before registration because the database state may already contain accounts.

---

### Artifact #4 — Load, Stress, and Spike JMeter plans

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 23:17, 17 November 2026
- Verbatim prompt: `ok bắt đầu làm giúp tôi`

**AI Output**

Complete outputs:

- `test-plans/23120202_Load_20261117.jmx`
- `test-plans/23120202_Stress_20261117.jmx`
- `test-plans/23120202_Spike_20261117.jmx`
- `scripts/generate_test_plans.mjs`

The generated plans correlated `token`, `product_id`, and `order_id`, then executed eight labelled HTTP requests from Login through Order detail.

**Verdict:** INCOMPLETE

**Reasoning**

RFC 7519 defines JWT as a compact claims representation suitable for HTTP authorization, so the token must be extracted from the login response and reused rather than hard-coded. RFC 9110 also distinguishes successful 2xx responses from 4xx client errors and 5xx server errors, but an HTTP 200 assertion alone does not prove that correlation variables exist. Apache JMeter recommends CLI execution with few listeners during high-load tests.

**Student Fix**

The student verified all eight requests by smoke tests and added checks that `token`, `product_id`, and `order_id` are not missing. Spike was changed to show **baseline → burst → recovery**. View Results Tree was limited to errors. After the endurance run exposed downstream `NOT_FOUND` noise, failure handling was changed to **start the next loop at the first failed sampler**.

---

### Artifact #5 — Run and resource-monitor scripts

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 12:54, 18 November 2026
- Verbatim prompt: `ok bạn thực hiện tiếp giúp tôi đi`

**AI Output**

Complete outputs: `scripts/run_scenario.sh` and `scripts/run_with_monitor.sh`.

The initial wrapper ran JMeter together with `pidstat` and `vmstat`, then attempted to stop both collectors after JMeter exited.

**Verdict:** INVALID

**Reasoning**

The first implementation left `vmstat` alive after the completed Load run, causing the wrapper to hang. A script that does not terminate reliably is not acceptable automation even when the JTL file itself is valid. HW05 §6 requires attributable resource evidence for each run; collector lifecycle and filenames therefore have to be deterministic.

**Student Fix**

The signal was corrected from **SIGINT to SIGTERM**, collector child processes were checked, and run IDs were propagated consistently to JTL, HTML, JMeter, `pidstat`, and `vmstat` outputs. The failed wrapper behavior was rejected; only runs with complete matching artifacts were used.

---

### Artifact #6 — Initial AI performance analysis

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 12:54, 18 November 2026
- Verbatim prompt: `ok bạn thực hiện tiếp giúp tôi đi`

**AI Output**

Complete verbatim output: `analysis/ai_initial_analysis.md`.

Verbatim excerpt:

> AI kết luận 300 users, khoảng 457 request/giây, là maximum stable throughput của máy. AI cho rằng nguyên nhân chính của degradation là SQLite lock/I/O saturation và có dấu hiệu memory leak vì RSS backend tăng theo thời gian.

**Verdict:** INVALID

**Reasoning**

The output confused the bounded HTML percentile with the exact whole-run percentile, treated a low whole-run error rate as evidence of stability, and promoted plausible correlations to proven causes. HW05 Task 2 explicitly requires checking AI claims against raw JTL values. A threshold found among a few tested levels is not the machine's absolute maximum.

**Student Fix**

The review in `analysis/human_review.md` corrected:

- HTML endurance p95 **1,863 ms** versus exact whole-run raw-JTL p95 **582 ms**.
- Whole-run error rate **0.0428%** versus final-window error rate **1.492%**.
- “Maximum” to **highest verified stable tested level**.
- “SQLite root cause” to **unconfirmed I/O/lock hypothesis**.
- “Memory leak” to **observed RSS growth requiring heap profiling**.

---

### Artifact #7 — Raw-JTL window and spike-phase analysis

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 12:54, 18 November 2026
- Verbatim prompt: `ok bạn thực hiện tiếp giúp tôi đi`

**AI Output**

Complete outputs: `scripts/analyze_jtl_windows.mjs`, `scripts/analyze_spike_phases.mjs`, `scripts/check_jtl.mjs`, and `agent-skill/performance-jtl-review/`.

Verbatim result excerpt:

> Spike phase analysis xác nhận rõ: baseline p95 14 ms; trong burst p95 1.084 ms; 10 giây chuyển tiếp p95 283 ms; sau đó settled recovery trở về p95 12 ms, gần như baseline, và không có lỗi.

**Verdict:** VALID

**Reasoning**

The calculations were rerun against raw JTL data and kept request labels `01`–`08` separate from preparation samples and the parent transaction. Windowed analysis exposed late-run degradation that whole-run averages concealed. This directly satisfies HW05 Task 2's requirement to cite correct values from raw logs.

**Student Fix**

No formula correction was required after independent reruns. The student limited the conclusion to the measured machine and kept smoke/verify results out of the official summary.

---

### Artifact #8 — Human-review draft and recommendation classification

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 12:54, 18 November 2026
- Verbatim prompt: `ok bạn thực hiện tiếp giúp tôi đi`

**AI Output**

Complete outputs: `analysis/human_review.md` and the recommendation table in `report/main_report.md`.

The generated review classified WAL as an experiment, index/connection-pool changes as unsupported, and clearing the cart after checkout as a recommendation grounded in code and specification.

**Verdict:** INCOMPLETE

**Reasoning**

The classification appropriately separated observation, hypothesis, and verified cause, but an AI-authored “human review” cannot be accepted by name alone. The student remains responsible for checking every number and recommendation against JTL, resource logs, API specification, and backend source.

**Student Fix**

The student inspected the displayed JMeter reports during the demo, requested clarification of the p95 and smoke/verify wording, and accepted only recommendations supported by actual artifacts. The final report explicitly says that WAL needs an A/B test and that profiling is needed before claiming a leak.

---

### Artifact #9 — Live evidence reruns and evidence manifest

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 23:02, 21 November 2026
- Verbatim prompt: `rerun lấy ảnh live giúp tôi`

**AI Output**

Verbatim excerpt:

> Cả ba rerun đã hoàn tất với exit code 0. Mình đang tạo ảnh phần cứng trực tiếp từ thông tin hệ điều hành, CPU, RAM, ổ đĩa, Java và Node trên máy; sau đó sẽ lập manifest nối từng ảnh với đúng JTL, HTML report và resource log của rerun.

Complete outputs are stored in `evidence/screenshots/` and documented in `evidence/screenshots/README.md`.

**Verdict:** VALID

**Reasoning**

HW05 §6 requires the tool and resource monitor in the same frame for each scenario, plus hardware evidence. The reruns produced real JMeter output and sampled the actual backend PID. The report does not substitute video frames or fabricate screenshots.

**Student Fix**

No image manipulation was accepted. The student required new live reruns after rejecting the idea of taking evidence from the demo video. The final report clearly labels the 21 November reruns as **evidence reruns**, while the 18 November raw JTL runs remain the official numerical results.

---

### Artifact #10 — Public repository and GitHub performance issue

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 11:51, 22 November 2026
- Verbatim prompt: `https://youtu.be/tAsw4BRn0uIđây là link youtube cần github bạn tạo repo rồi đẩy github issue lên giúp tôi nhớ tách commit rõ ràng nha`

**AI Output**

Verbatim excerpts:

> Repository đã được tạo và push thành công: `https://github.com/vinh-code/hw05-performance-testing-23120202`.

> GitHub Issue đã đăng thành công: `https://github.com/vinh-code/hw05-performance-testing-23120202/issues/1`.

Complete issue source: `issues/ISSUE-001-endurance-degradation.md`.

**Verdict:** INCOMPLETE

**Reasoning**

HW05 §6 asks students to report genuine performance issues with screenshots, and §12 asks for separate Git commits. The generated issue had to distinguish measured symptoms from speculative causes; otherwise it could falsely present SQLite or memory behavior as proven root causes.

**Student Fix**

The issue was revised to attach 500/800-user degradation evidence, reproduction steps, expected/actual behavior, and the explicit caveat that **SQLite contention and memory growth are hypotheses, not proven causes**. Results, video, issue evidence, URLs, and final commit-log updates were separated into distinct commits.

## 4. Summary of AI Accuracy

| Metric | Count | Percentage |
|---|---:|---:|
| Total AI-generated artifacts audited | 10 | 100% |
| VALID (correct, accepted as-is) | 3 | 30% |
| INVALID (wrong; rejected) | 2 | 20% |
| INCOMPLETE (acceptable after edits) | 5 | 50% |

## 5. Conclusion — When Should AI Be Used?

AI was most effective at accelerating repetitive engineering work: mapping the API flow, generating JMeter XML, preparing CSV data, correlating identifiers, and building scripts for JTL analysis. It was less reliable when interpreting performance evidence. It confused percentile scopes, treated a tested stable level as an absolute maximum, and promoted SQLite contention and memory growth from hypotheses to causes. The audit also found a real automation defect when the first monitor wrapper failed to terminate `vmstat`. For future performance testing, AI should generate an initial design and automate repeatable calculations, while the student must run the system, preserve raw evidence, verify time-window metrics, and separate observation from causation. AI recommendations should be accepted only after code inspection or a controlled A/B experiment.

## 6. Mandatory Disclosure

> "JMeter test plans, scripts, dataset, and report drafts were initially generated by OpenAI Codex; I reviewed and modified the load models, correlation, failure handling, and metric interpretation, added per-virtual-user data pinning, spike recovery, and time-window endurance checks; the real test execution, evidence capture, and final acceptance decisions were performed entirely by me. The detailed AI Audit Report is attached as Appendix A. I confirm I did not use AI to generate any artifact listed in the prohibited category."

## Signature

| Field | Value |
|---|---|
| Student name (printed) | Phạm Quang Vinh |
| Student ID | 23120202 |
| Class / Cohort | CQ2023/31 |
| Course | CS423 / CSC13003 — Software Testing |
| Instructor | Dr. Lam Quang Vu / Dr. Tran Duy Hoang / MSc. Tran Thi Bich Hanh / MSc. Truong Phuoc Loc / MSc. Ho Tuan Thanh |
| Date | 23 November 2026 |
| Signature | Phạm Quang Vinh |

## References

1. FIT@HCMUS, *HW05 — Performance Testing*, §§5–6, 9–14, 2026.
2. Apache JMeter, *User's Manual — Component Reference: CSV Data Set Config*, <https://jmeter.apache.org/usermanual/component_reference.html>.
3. Apache JMeter, *User's Manual — Best Practices: Reducing Resource Requirements*, <https://jmeter.apache.org/usermanual/best-practices.html>.
4. IETF, *RFC 7519 — JSON Web Token (JWT)*, <https://www.rfc-editor.org/rfc/rfc7519.html>.
5. IETF, *RFC 9110 — HTTP Semantics*, <https://www.rfc-editor.org/rfc/rfc9110.html>.
6. ISTQB, *Certified Tester Foundation Level Syllabus*, latest course-referenced edition.

