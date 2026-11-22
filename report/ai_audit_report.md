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

This report declares: **I use AI tools for the following tasks.** One entry is recorded per AI-assisted artifact rather than per short clarification message. Prompts are copied verbatim from the engineering dialogue with OpenAI Codex across the project lifecycle. Because source files such as JMeter plans and analysis scripts are the primary outputs, the complete artifacts reside at the stated repository paths; representative verbatim excerpts are reproduced below to make each interaction auditable. Real JTL measurements, system resource logs, screenshots, the public repository, GitHub issues, and the student's signature are execution evidence rather than AI-generated content.

Verdicts use the course template definitions:

- **VALID** — correct and accepted without a substantive correction.
- **INVALID** — the generated artifact was wrong or unsafe to use until replaced.
- **INCOMPLETE** — useful, but accepted only after human review, verification, and correction.

## 3. Audit Table — One Entry per Artifact

### Artifact #1 — Assignment interpretation and workflow selection

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 22:26, 17 November 2026
- Verbatim prompt:
  ```text
  hãy đọc đề 2026.HW05.Performance Testing_En.pdf và giải thích đề sau đó gợi ý workflow giúp tôi, flow 1 và 2 đã có người chọn rồi
  ```

**AI Output**

Verbatim excerpt:

> Mình khuyên bạn chọn **Flow 4 – Cập nhật hồ sơ → Mua**. Trong ba flow còn lại, đây là lựa chọn cân bằng nhất: đủ Auth–Read–Transactional, dễ tạo dữ liệu CSV và ít rủi ro hơn Flow 3 hoặc Flow 5.

The resulting workflow is documented in `README.md` and `docs/test-design.md`:

`Login → Get profile → Update profile → Search products → Product detail → Add to cart → Checkout → Order detail`

**Verdict:** VALID

**Reasoning**

HW05 §§5–6 requires an end-to-end user scenario covering three distinct endpoint groups: Auth-heavy, Read-heavy, and Transactional. Flow 4 maps directly to these categories:
- Auth-heavy: `POST /api/login` (JWT creation)
- Read-heavy: `GET /api/users/me`, `GET /api/products`, `GET /api/products/:id`, `GET /api/orders/:id`
- Transactional: `PUT /api/users/me`, `POST /api/cart`, `POST /api/checkout`

**Student Fix**

No technical correction was required. The student verified availability in the course group allocation, confirmed the flow with team members, and structured the project documentation accordingly (`commit 3036ca6`).

---

### Artifact #2 — Test design and scenario load models

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 22:45, 17 November 2026
- Verbatim prompt:
  ```text
  dựa trên Flow 4 đã chọn và API specification của EShop backend, hãy phân tích cấu trúc từng request và đề xuất tài liệu test design cùng các thông số ban đầu cho Load, Stress, Spike test theo yêu cầu của HW05
  ```

**AI Output**

Complete output: `docs/test-design.md`.

Verbatim excerpt:

> Đánh giá backend EShop dưới tải bình thường, tải tăng đến giới hạn và tải tăng đột ngột bằng cùng một workflow end-to-end.
> - Load: 20 users, ramp-up 120s, duration 300s
> - Stress: 60 users, ramp-up 180s, duration 360s
> - Spike: baseline 5 users, burst 80 users, burst ramp 2s

**Verdict:** INCOMPLETE

**Reasoning**

Per ISTQB FL §1.4 (Test Activities) and HW05 §6, test design parameters must challenge the System Under Test (SUT) against the actual hardware capacity. The student host machine is equipped with an Intel Core i7-12650H (10 cores, 16 threads) and 15 GiB RAM. The AI's proposed concurrency of 60 users for Stress and 80 users for Spike was an ungrounded guess that would fail to saturate the CPU or expose backend breaking points.

**Student Fix**

The student retained 20 users for Load as a baseline comparison, but rejected the arbitrary 60/80 concurrency levels. The student mandated multi-stage calibration runs for Stress at **200, 500, and 1,000 users**, scaled Spike burst to **1,000 users**, and added 10-minute endurance tests at **300, 500, and 800 users** to establish true empirical stability (`commit 24605a0`).

---

### Artifact #3 — CSV test dataset and user seeding automation

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 23:05, 17 November 2026
- Verbatim prompt:
  ```text
  hãy viết script tạo dữ liệu người dùng test-data/users.csv và script seed vào DB EShop backend để phục vụ test kịch bản Flow 4, chú ý luồng này có cập nhật profile và đặt hàng
  ```

**AI Output**

Complete outputs: `test-data/users.csv`, `scripts/generate_test_data.mjs`, and `scripts/seed_test_users.sh`.

Verbatim CSV excerpt:

```csv
email,password,name,phone,address,keyword
perf0001@example.test,Test1234!,Perf User 0001,0910000001,0001 Nguyen Van Cu District 1 HCMC,iPhone
```

**Verdict:** INCOMPLETE

**Reasoning**

HW05 §6 mandates realistic data-driven testing. The AI initially generated only 100 user rows. At high concurrency (up to 1,000 threads), multiple threads sharing the same 100 accounts would generate artificial race conditions and row-locking contention on `PUT /api/users/me` and `POST /api/cart`. Furthermore, JMeter's default CSV Data Set Config cycles through rows, meaning a virtual user would change identity mid-loop.

**Student Fix**

The student expanded the generator to synthesize **1,200 unique accounts**. In the JMeter test plans, the student introduced a **Once Only Controller** that captures the CSV row once per thread and stores it in thread-local `vu_*` variables, guaranteeing session identity persistence. The seed script was enhanced to check login before registration for idempotent database initialization (`commit 3036ca6` & `commit 2a5a0bd`).

---

### Artifact #4 — Initial JMeter test plans and dynamic correlation

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 23:20, 17 November 2026
- Verbatim prompt:
  ```text
  hãy viết script generate_test_plans.mjs sinh ra 3 file JMX cho Load, Stress, Spike kiểm thử đầy đủ 8 bước của Flow 4, cấu hình trích xuất động JWT token, product id và order id từ response
  ```

**AI Output**

Complete outputs: `scripts/generate_test_plans.mjs` and initial JMX test plans:
- `test-plans/23120202_Load_20261117.jmx`
- `test-plans/23120202_Stress_20261117.jmx`
- `test-plans/23120202_Spike_20261117.jmx`

**Verdict:** INCOMPLETE

**Reasoning**

Under RFC 7519 (JWT) and RFC 9110 (HTTP Semantics), dynamic response data must be correlated across request steps. While the AI added JSON Extractors, it only asserted HTTP status code 200 without validating whether the extracted variables (`token`, `vu_productId`, `vu_orderId`) were non-empty. If an upstream call returned an unexpected payload, downstream requests would proceed with empty values (e.g. `Bearer null`), giving false results. Additionally, enabling full tree listeners in CLI runs causes severe JMeter heap exhaustion.

**Student Fix**

The student ran smoke verifications, added explicit Response Assertions verifying that `token`, `vu_productId`, and `vu_orderId` are non-empty, and limited View Results Tree listeners to save error samples only (`commit 431c290`, `commit 0e1a829`, `commit 6a55a21`, and `commit 76d0595`).

---

### Artifact #5 — Spike test recovery modeling and failure cascading prevention

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 23:25, 17 November 2026
- Verbatim prompt:
  ```text
  tôi đã chạy thử smoke test: kịch bản Spike hiện tại chưa đúng yêu cầu vì chỉ tăng tải rồi dừng chứ không có pha hồi phục (recovery). Đồng thời khi tải cao bị timeout ở bước checkout thì các request sau bị lỗi 404 dây chuyền. Hãy sửa lại test plan Spike mô hình hóa 3 pha và cấu hình lại error handling
  ```

**AI Output**

Updated `scripts/generate_test_plans.mjs` and `test-plans/23120202_Spike_20261117.jmx`.

Verbatim excerpt:

> Spike phase architecture: Thread Group 1 (Baseline: 20 users for 180s); Thread Group 2 (Spike burst: 1,000 users starting at s60 for 30s with 2s ramp).

**Verdict:** INCOMPLETE

**Reasoning**

HW05 §6 explicitly requires assessing system behavior *after* a spike (recovery characteristics). A single thread group ramping up and ending cannot observe recovery. Furthermore, when a sampler encounters a timeout under heavy load, default JMeter behavior proceeds to subsequent samplers with `NOT_FOUND` fallback values, producing cascades of 400/403/404 errors that artificially inflate failure rates and conceal the primary root error.

**Student Fix**

The student verified the dual-thread-group model: **pre-spike baseline $\to$ 30s burst $\to$ 10s immediate recovery $\to$ settled baseline recovery**. The student updated failure handling across all test plans to **`startnextloop`** on sampler error, ensuring that when an upstream request fails, the thread immediately terminates the current iteration and begins fresh, eliminating cascading secondary errors (`commit 76d0595` & `commit 2a5a0bd`).

---

### Artifact #6 — Automated execution and resource monitoring scripts

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 12:40, 18 November 2026
- Verbatim prompt:
  ```text
  hãy viết script run_with_monitor.sh để chạy JMeter non-GUI tự động, đồng thời chạy background pidstat giám sát tiến trình backend và vmstat giám sát hệ thống, khi JMeter kết thúc thì tự động dừng cả hai và xuất file log tương ứng
  ```

**AI Output**

Complete outputs: `scripts/run_with_monitor.sh` and `scripts/run_scenario.sh`.

Verbatim excerpt:

```bash
pidstat -p "$BACKEND_PID" -u -r 1 > "$PIDSTAT_LOG" &
vmstat 1 > "$VMSTAT_LOG" &
# ... run JMeter ...
kill -INT $PIDSTAT_PID $VMSTAT_PID
```

**Verdict:** INVALID

**Reasoning**

HW05 §6 requires attributable resource logs (`pidstat`, `vmstat`) synchronized with every test execution. The AI's script used `kill -INT` to terminate background collectors. In non-interactive Bash subshells on Linux, `vmstat` ignores `SIGINT`, causing the monitoring wrapper to hang indefinitely after JMeter finishes and leaving orphan processes locking log files.

**Student Fix**

The student rejected the script, switched process termination from **`SIGINT` to `SIGTERM`**, added an explicit process exit check (`wait "$PID"`), and verified that log files (`*_backend_pidstat.txt` and `*_system_vmstat.txt`) close cleanly with matching run identifiers (`commit 3036ca6` & `commit 2a5a0bd`).

---

### Artifact #7 — Initial AI performance analysis and misinterpretation hunt

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 13:45, 18 November 2026
- Verbatim prompt:
  ```text
  tôi đã chạy xong các bài test chính thức: Load 20 users, Stress 1000 users, và Endurance 3 mức 800, 500, 300 users. Đây là các file log JTL và JMeter HTML dashboard. Hãy đọc kết quả và phân tích hiệu năng của hệ thống giúp tôi
  ```

**AI Output**

Complete output: `analysis/ai_initial_analysis.md`.

Verbatim excerpt:

> AI kết luận 300 users, khoảng 457 request/giây, là maximum stable throughput của máy. AI cho rằng nguyên nhân chính của degradation là SQLite lock/I/O saturation và có dấu hiệu memory leak vì RSS backend tăng theo thời gian. Endurance 800 users có p95 khoảng 1.863 ms và error rate 0.0428%, nhìn chung hệ thống vẫn đáp ứng tốt.

**Verdict:** INVALID

**Reasoning**

HW05 Task 2 requires critically reviewing AI analysis to catch misinterpretations. The AI committed four critical analytical flaws:
1. **Scope confusion:** It cited 1,863 ms as the whole-run p95 for Endurance 800 users. This number was merely the JMeter HTML dashboard's sliding-window percentile; the exact whole-run p95 calculated from the raw JTL was **582 ms**.
2. **Masked degradation:** It dismissed Endurance 800 degradation because the whole-run error rate was 0.0428%, completely ignoring that the final 30-second window collapsed with a **1.492% error rate** and **p95 of 4,540 ms**.
3. **False absolute maximum:** It declared 300 users the "absolute maximum stable throughput" of the hardware, confusing the highest tested level with an absolute mathematical bound.
4. **Premature causation:** It proclaimed SQLite lock saturation and memory leaks as proven root causes without profiling traces or heap dumps.

**Student Fix**

In `analysis/human_review.md` and `report/ai_critique.md`, the student corrected every metric scope, distinguished exact raw JTL percentiles from HTML dashboard windows, re-labeled 300 users as the **highest verified stable tested level**, and reclassified SQLite contention and memory accumulation as **hypotheses** requiring profiling verification (`commit 2ae98f2`).

---

### Artifact #8 — Raw-JTL time-window and spike phase analysis tools

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 13:55, 18 November 2026
- Verbatim prompt:
  ```text
  vì số liệu trung bình toàn run của AI che giấu lỗi cuối bài endurance, hãy viết các script Node.js phân tích trực tiếp file raw JTL: check_jtl.mjs để tính p95 chính xác cho từng endpoint, analyze_jtl_windows.mjs chia theo từng cửa sổ 30 giây, và analyze_spike_phases.mjs phân tách 4 pha của Spike test
  ```

**AI Output**

Complete outputs: `scripts/check_jtl.mjs`, `scripts/analyze_jtl_windows.mjs`, and `scripts/analyze_spike_phases.mjs`.

Verbatim excerpt:

```text
Spike phase analysis:
- Pre-spike baseline (s0–s60): 1,617 samples, 28.23 req/s, p95 14 ms, 0 errors
- Spike burst (s60–s90): 32,876 samples, 1,079.03 req/s, p95 1,084 ms, 0 errors
- Immediate recovery (s90–s100): 2,392 samples, 240.47 req/s, p95 283 ms, 0 errors
- Settled recovery (s100–s180): 2,487 samples, 30.56 req/s, p95 12 ms, 0 errors
```

**Verdict:** VALID

**Reasoning**

HW05 Task 2 requires extracting factual metrics directly from raw execution logs. The windowing script accurately divided the 630-second endurance tests into 30-second buckets, exposing the throughput collapse at s570–s630 that whole-run averages masked. The spike phase analyzer correctly segmented the four distinct phases of the spike test.

**Student Fix**

The student verified the mathematical calculations against raw JTL timestamps and response times, ensuring individual request samplers (`01_POST_login` through `08_GET_order_detail`) were computed separately from transaction controllers (`commit 2ae98f2` & `commit bb7cc1d`).

---

### Artifact #9 — Human review of AI recommendations and Agent Skill packaging

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 14:05, 18 November 2026
- Verbatim prompt:
  ```text
  AI đã đề xuất 5 giải pháp: bật WAL, thêm DB index, thêm connection pool, cache product read, và chuyển PostgreSQL. Hãy đối chiếu với source code EShop backend xem cái nào khả thi, đồng thời đóng gói phương pháp review JTL thành một Agent Skill theo format Antigravity
  ```

**AI Output**

Complete outputs: `report/ai_critique.md`, recommendation evaluation table in `report/main_report.md`, and `agent-skill/performance-jtl-review/SKILL.md`.

Verbatim excerpt:

> Đánh giá tối ưu: Bật WAL (Khả thi để thử A/B); Thêm index (Chưa có cơ sở); Connection pool (Không có cơ sở); Xóa cart sau checkout (Khả thi và bắt buộc); Chuyển PostgreSQL (Dài hạn).

**Verdict:** INCOMPLETE

**Reasoning**

AI generated generic optimization suggestions without examining the SUT implementation. Code inspection of `sut/backend/database.js` shows SQLite operates in single-process mode with a single connection; adding a pool does not remove the single-writer lock. Product search uses `LIKE '%keyword%'`, which cannot utilize standard B-tree indexes due to the leading wildcard. Crucially, the AI missed a functional defect in `sut/backend/server.js`: the backend never clears `userCarts` after checkout, retaining cart arrays in memory indefinitely.

**Student Fix**

The student updated the recommendation review table to classify cart cleanup as the only grounded code fix, designated SQLite WAL as an A/B experiment, rejected connection pooling and generic indexing, and formalized the raw-JTL verification rules into the reusable `agent-skill/performance-jtl-review/` (`commit 2ae98f2` & `commit bb7cc1d`).

---

### Artifact #10 — Public repository, GitHub issue, and live evidence documentation

**Prompt + Tool**

- Tool: OpenAI Codex
- Time: 11:45, 22 November 2026
- Verbatim prompt:
  ```text
  tôi đã chạy live rerun để chụp màn hình có đủ thanh tác vụ/đồng hồ cho Load, Stress, Spike và quay video demo (link YouTube: https://youtu.be/tAsw4BRn0uI). Hãy giúp tôi soạn tài liệu GitHub Issue cho bug sụt giảm hiệu năng ở cuối bài endurance, ghi rõ các bước tái hiện và phân biệt giữa triệu chứng đo được với giả thuyết nguyên nhân, sau đó hỗ trợ thiết lập public repo và tách commit theo yêu cầu của đề
  ```

**AI Output**

Complete outputs: `issues/ISSUE-001-endurance-degradation.md`, `evidence/screenshots/README.md`, and git commit structuring.

Verbatim excerpt:

> Public Repository: `https://github.com/vinh-code/hw05-performance-testing-23120202`
> GitHub Issue #1: `https://github.com/vinh-code/hw05-performance-testing-23120202/issues/1`

**Verdict:** INCOMPLETE

**Reasoning**

HW05 §6 mandates filing genuine performance bug reports with reproduction steps, actual vs. expected behavior, and screenshot evidence. HW05 §12 requires discrete Git commits. The AI's initial issue draft asserted SQLite lock contention as an established fact rather than a hypothesis.

**Student Fix**

The student revised the issue report to explicitly state that SQLite contention and memory retention are unverified hypotheses, attached the 30-second degradation evidence screenshot (`05-endurance-degradation.png`), published [GitHub Issue #1](https://github.com/vinh-code/hw05-performance-testing-23120202/issues/1), pushed the public repository [vinh-code/hw05-performance-testing-23120202](https://github.com/vinh-code/hw05-performance-testing-23120202), and separated test results, video, issue evidence, and documentation into clean, atomic commits (`commit 4f962c2`, `commit af7ddf7`, `commit d4f2ed6`, `commit 490b87b`, `commit c80ff5d`, `commit 86a7ac8`).

---

## 4. Summary of AI Accuracy

| Metric | Count | Percentage |
|---|---:|---:|
| Total AI-generated artifacts audited | 10 | 100% |
| VALID (correct, accepted as-is) | 2 | 20% |
| INVALID (wrong; rejected or rewritten) | 2 | 20% |
| INCOMPLETE (acceptable only after human correction) | 6 | 60% |

## 5. Conclusion — When Should AI Be Used?

AI was most effective at accelerating repetitive engineering tasks: scaffolding the project layout, mapping the 8-step API sequence, synthesizing JMeter XML elements, generating initial CSV user structures, and drafting Node.js parsing scripts for raw JTL logs.

Conversely, AI proved unreliable when interpreting performance metrics and diagnosing bottlenecks. It repeatedly confused statistical scopes (sliding-window HTML percentiles vs. exact full-run raw JTL percentiles), allowed whole-run average error rates to mask severe degradation in the final minutes of endurance testing, and jumped prematurely from statistical correlation to causal claims (proclaiming SQLite lock contention as a "proven root cause" and RSS accumulation as a "confirmed memory leak"). Furthermore, the AI proposed generic optimizations (SQLite connection pools, B-tree indexes for leading wildcards) that contradicted the SUT architecture, while missing an actual in-memory cart retention bug.

**Recommendation:** AI should be used as a disciplined junior assistant to scaffold kịch bản, generate repetitive configurations, and draft calculation utilities. The human tester must independently verify execution logs, inspect system code, enforce time-window metric segmentation, and validate all causality claims through rigorous evidence and controlled experiments.

## 6. Mandatory Disclosure

> "JMeter test plans, scripts, dataset, and report drafts were initially generated with assistance from OpenAI Codex; I reviewed and modified the load models, correlation assertions, failure handling (`startnextloop`), and metric interpretation, added per-virtual-user data pinning, spike recovery phases, and 30-second time-window endurance checks; the real test execution, evidence capture, SUT source auditing, and final acceptance decisions were performed entirely by me. The detailed AI Audit Report is attached as Appendix A. I confirm I did not use AI to generate any artifact listed in the prohibited category."

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
7. Kharbach, M. (2026). *AI Use Policy Templates for Higher Education*. CC BY-NC-SA 4.0.
