# Coach UI implementation / 教练端 UI 改造说明

This delivery covers the coach workspace only; coaches maintain the new client, preparation, appointment, credit, nutrition and review data. Existing theme tokens remain unchanged, and the 3D exercise guide and all existing personal training features remain available. New coach data is saved in this browser, demo data is isolated from the signed-in workspace, and these new modules do not yet connect to Azure backend storage or a student-facing application.

本轮只实现教练端，由教练维护新增的学员、备赛、排课、课时、营养和复盘数据。现有主题 tokens 未改，3D 动作指引及全部已有个人训练功能保留。新增教练数据保存在本机浏览器，演示数据与登录工作区隔离，新增模块尚未接入 Azure 后端存储或学员端。

Validation: `npm test` passes all 55 tests, and `npm run build` succeeds. Browser verification covered desktop and phone layouts, linked dashboard/scheduling calendars, appointment creation and cancellation without a credit debit, coach-entered nutrition persistence and client switching, and the original 3D model loading successfully. The pre-existing `TrainingPage.tsx` working-tree changes are outside this delivery and are excluded below.

验证：`npm test` 共 55 项全部通过，`npm run build` 成功。浏览器已检查桌面与手机布局、工作台／排课日历联动、创建预约和取消不扣课、教练营养记录保存及切换学员，以及原有 3D 模型成功加载。开始前已存在的 `TrainingPage.tsx` 工作区改动不属于本轮交付，以下不作说明。

## Frontend entry and navigation / 前端入口与导航

File: `client/src/App.tsx`
文件：`client/src/App.tsx`

EN:
What was added or changed: Connected the six coach pages, scoped workspace provider and isolated demo entry while preserving personal routes.
Why this file exists: It coordinates application navigation, authentication transitions and the active workspace.
What to review: Check login, logout, demo exit and account changes for the correct destination and data scope.

中文：
添加或修改了什么：接入六个教练页面、工作区状态和独立演示入口，同时保留个人功能路由。
为什么需要这个文件：统一处理应用导航、登录状态切换和当前工作区。
需要 review 什么：检查登录、退出、离开演示及切换账号时的页面去向与数据归属。

File: `client/src/components/AppShell.tsx`
文件：`client/src/components/AppShell.tsx`

EN:
What was added or changed: Added grouped coach navigation, mobile access, workspace disclosure and local data export.
Why this file exists: It provides a consistent shell for coach workflows and the retained personal tools.
What to review: Confirm every old feature remains reachable, the 3D entry stays visible and storage boundaries are clear.

中文：
添加或修改了什么：新增教练分组导航、移动端入口、工作区存储提示和本机数据导出。
为什么需要这个文件：为教练流程与保留的个人工具提供统一外壳。
需要 review 什么：确认旧功能均可进入、3D 入口清晰，且数据保存范围说明准确。

File: `client/src/data/navigation.ts`
文件：`client/src/data/navigation.ts`

EN:
What was added or changed: Defined coach, personal, movement and account navigation groups and the coach-page set.
Why this file exists: It keeps labels and page grouping consistent across desktop and mobile navigation.
What to review: Check page names, ordering and the retained personal and 3D destinations.

中文：
添加或修改了什么：定义教练、个人、动作教学和账户导航分组，并标识教练页面集合。
为什么需要这个文件：保持桌面与移动端的页面名称及分组一致。
需要 review 什么：检查名称、排序，以及个人功能和 3D 页面是否完整保留。

File: `client/src/pages/LoginPage.tsx`
文件：`client/src/pages/LoginPage.tsx`

EN:
What was added or changed: Updated the product wording and added an optional demo-workspace entry.
Why this file exists: It lets users understand and preview the coach workspace before signing in.
What to review: Confirm normal authentication still works and the demo is clearly identified as sample data.

中文：
添加或修改了什么：更新产品定位文案，并增加可选的教练工作台演示入口。
为什么需要这个文件：让用户登录前即可了解并体验教练工作区。
需要 review 什么：确认原有登录流程正常，演示入口明确标注示例数据。

File: `client/src/types/appTypes.ts`
文件：`client/src/types/appTypes.ts`

EN:
What was added or changed: Added coach page keys and navigation-group metadata without removing existing types.
Why this file exists: It keeps routing and navigation references checked by TypeScript.
What to review: Confirm new page keys match their routes and all existing keys remain available.

中文：
添加或修改了什么：增加教练页面标识和导航分组字段，未删除已有类型。
为什么需要这个文件：通过 TypeScript 保持页面路由与导航引用一致。
需要 review 什么：确认新增标识与页面对应，原有页面标识全部保留。

File: `client/src/coach.css`
文件：`client/src/coach.css`

EN:
What was added or changed: Added coach-shell, dashboard, calendar, form and responsive styles within the existing dark-blue and cyan theme.
Why this file exists: It supplies shared visual rules for the new coach experience without changing the original theme tokens.
What to review: Check desktop and mobile layouts, readable contrast and the retained personal pages for style regressions.

中文：
添加或修改了什么：沿用暗蓝与青色主题，增加教练外壳、工作台、日历、表单和响应式样式。
为什么需要这个文件：为教练体验提供共享视觉规则，同时保持原主题 tokens。
需要 review 什么：检查桌面与移动端布局、文字对比度，以及个人页面是否受样式影响。

## Shared coach components / 共享教练组件

File: `client/src/components/coach/CoachUI.tsx`
文件：`client/src/components/coach/CoachUI.tsx`

EN:
What was added or changed: Added reusable page headers, cards, client avatars, status badges, client selection, empty states and keyboard-aware modals.
Why this file exists: It keeps coach pages visually consistent and avoids duplicating common controls.
What to review: Check meaningful labels, modal focus, Escape closing and client selection across pages.

中文：
添加或修改了什么：新增页头、卡片、学员头像、状态标识、学员选择、空状态及支持键盘操作的弹窗。
为什么需要这个文件：保持教练页面一致，并复用通用交互控件。
需要 review 什么：检查控件标签、弹窗焦点、Escape 关闭和跨页学员选择。

File: `client/src/components/coach/CoachCalendar.tsx`
文件：`client/src/components/coach/CoachCalendar.tsx`

EN:
What was added or changed: Added shared compact and full month calendars with appointments, selected dates and booking entry points.
Why this file exists: It embeds the requested calendar into both the initial dashboard and scheduling workflow.
What to review: Check month navigation, today, appointment visibility and the selected-date handoff to scheduling.

中文：
添加或修改了什么：新增紧凑与完整月历，展示课程、选中日期和预约入口。
为什么需要这个文件：满足初始化工作台及排课页面嵌入日历的要求。
需要 review 什么：检查月份切换、回到今天、课程展示及选中日期向排课页的传递。

## Coach pages / 教练页面

File: `client/src/pages/CoachOverviewPage.tsx`
文件：`client/src/pages/CoachOverviewPage.tsx`

EN:
What was added or changed: Added the coach dashboard with summary counts, embedded calendar, daily agenda, preparation overview and follow-up links.
Why this file exists: It gives coaches a practical first screen for daily teaching and competition-preparation management.
What to review: Check counts against actual workspace data, date and client scope, and the prominent 3D and personal-tool links.

中文：
添加或修改了什么：新增教练工作台，包含概览指标、嵌入日历、当日日程、备赛进度和跟进入口。
为什么需要这个文件：为线下授课与备赛管理提供每日开始工作的首页。
需要 review 什么：核对指标与真实数据、日期和学员范围，以及醒目的 3D 与个人工具入口。

File: `client/src/pages/ClientsPage.tsx`
文件：`client/src/pages/ClientsPage.tsx`

EN:
What was added or changed: Added client search, phase filtering, profile editing, preparation details, latest nutrition and traceable session-credit entries.
Why this file exists: It organizes the coach-maintained client roster and centralizes related management actions.
What to review: Check profile validation, empty results, paused status and credit balances after purchases and course completion.

中文：
添加或修改了什么：新增学员搜索、阶段筛选、档案编辑、备赛信息、最近营养记录和可追溯课时流水。
为什么需要这个文件：集中组织由教练维护的学员档案及相关操作。
需要 review 什么：检查档案校验、空结果、暂停状态，以及购课和课程完成后的余额。

File: `client/src/pages/PreparationPage.tsx`
文件：`client/src/pages/PreparationPage.tsx`

EN:
What was added or changed: Added competition dates, preparation phases, stage goals and nutrition-target history by effective date.
Why this file exists: It connects competition planning with coach-defined daily macro targets.
What to review: Check optional competition dates, preparation order and historical versus future target versions.

中文：
添加或修改了什么：新增比赛日期、备赛阶段、阶段目标，以及按生效日期保存的营养目标历史。
为什么需要这个文件：连接备赛计划与教练设置的每日三大营养素目标。
需要 review 什么：检查可空比赛日期、备赛日期顺序及历史和未来目标版本。

File: `client/src/pages/NutritionPage.tsx`
文件：`client/src/pages/NutritionPage.tsx`

EN:
What was added or changed: Added coach-maintained daily protein, carbohydrate, fat and bodyweight records with target comparisons and history charts.
Why this file exists: It provides the requested three-macronutrient tracking within each client's preparation workspace.
What to review: Check grams, date-specific targets, edits and the distinction between missing, partial and explicit zero intake.

中文：
添加或修改了什么：新增由教练维护的每日蛋白质、碳水、脂肪和体重记录，以及目标对比和历史图表。
为什么需要这个文件：在每位学员的备赛工作区提供三大营养素摄入管理。
需要 review 什么：检查克数单位、当日生效目标、编辑流程，以及未填、部分填写和明确零摄入的区别。

File: `client/src/pages/SchedulePage.tsx`
文件：`client/src/pages/SchedulePage.tsx`

EN:
What was added or changed: Added the full calendar, daily agenda, booking creation and editing, cancellation, course completion and credit registration.
Why this file exists: It supports the in-person coaching workflow from arranging a lesson to recording its credit debit.
What to review: Check time conflicts, daily status filters, insufficient credits and exactly one debit per completed lesson.

中文：
添加或修改了什么：新增完整日历、按日日程、预约创建与编辑、取消、课程完成及课包登记。
为什么需要这个文件：支持线下私教从排课到完成扣课的完整流程。
需要 review 什么：检查时间冲突、当日状态筛选、余额不足及每节完成课程只扣一次课。

File: `client/src/pages/ReviewsPage.tsx`
文件：`client/src/pages/ReviewsPage.tsx`

EN:
What was added or changed: Added coach weekly observations, teaching feedback, next-week focus, review filters and summaries calculated from actual nutrition and weight records.
Why this file exists: It gives coaches a place to maintain weekly preparation reviews without introducing student submissions.
What to review: Check the selected client and week, draft versus completed reviews, missing-data summaries and the explicit photo-upload limitation.

中文：
添加或修改了什么：新增教练周观察、授课反馈、下周重点、复盘筛选，以及基于真实营养与体重记录的摘要。
为什么需要这个文件：为教练维护每周备赛复盘提供集中页面，不引入学员提交流程。
需要 review 什么：检查选中学员与周次、草稿和完成状态、缺失数据摘要及明确的照片上传限制。

File: `client/src/pages/clients-preparation.css`
文件：`client/src/pages/clients-preparation.css`

EN:
What was added or changed: Added responsive roster, profile, preparation-timeline, target-history and related form styles.
Why this file exists: It supports the detailed client and preparation layouts using the retained visual theme.
What to review: Check narrow-screen forms, long names, profile colors and target-history tables.

中文：
添加或修改了什么：新增学员名册、档案、备赛时间线、目标历史及相关表单的响应式样式。
为什么需要这个文件：沿用原视觉主题，支撑学员及备赛详情布局。
需要 review 什么：检查窄屏表单、长姓名、档案标识色和目标历史表格。

File: `client/src/pages/nutrition.css`
文件：`client/src/pages/nutrition.css`

EN:
What was added or changed: Added macro cards, intake forms, target comparisons, history charts and mobile nutrition layouts.
Why this file exists: It makes daily intake management readable across desktop and mobile screens.
What to review: Check units, chart labels, compact layouts and complete versus incomplete record states.

中文：
添加或修改了什么：新增营养素卡片、摄入表单、目标对比、历史图表和移动端营养页面样式。
为什么需要这个文件：确保桌面与移动端的每日摄入管理清晰可读。
需要 review 什么：检查单位、图表标签、紧凑布局和完整与未完整记录状态。

File: `client/src/pages/schedule-reviews.css`
文件：`client/src/pages/schedule-reviews.css`

EN:
What was added or changed: Added appointment agendas, status treatments, review worklists, weekly summaries and responsive modal forms.
Why this file exists: It styles the scheduling and review workflows consistently with the coach workspace.
What to review: Check calendar and agenda proportions, keyboard focus visibility, long notes and mobile stacking.

中文：
添加或修改了什么：新增课程日程、状态展示、复盘列表、周摘要及响应式弹窗表单样式。
为什么需要这个文件：让排课与复盘流程保持教练工作区的统一视觉。
需要 review 什么：检查日历与日程比例、键盘焦点可见性、长备注及移动端堆叠布局。

## Data, state and verification / 数据、状态与验证

File: `client/src/types/coach.ts`
文件：`client/src/types/coach.ts`

EN:
What was added or changed: Defined the coach workspace's clients, phases, appointments, credit ledger, macro targets, daily records and weekly reviews.
Why this file exists: It gives new coach features a shared data contract separate from existing personal records.
What to review: Check required fields, optional intake values, appointment states and credit-entry semantics.

中文：
添加或修改了什么：定义教练工作区的学员、阶段、预约、课时流水、营养目标、每日记录和周复盘类型。
为什么需要这个文件：为新增教练功能建立独立于旧个人记录的共享数据约定。
需要 review 什么：检查必填字段、可空摄入值、预约状态和课时流水含义。

File: `client/src/data/coachDemoData.ts`
文件：`client/src/data/coachDemoData.ts`

EN:
What was added or changed: Added clearly separated sample clients, appointments, credits, targets, intake records and reviews for the demo workspace.
Why this file exists: It makes the initial coach interface reviewable without requiring real client data or an Azure deployment.
What to review: Confirm demo records are recognizable as examples and do not populate the signed-in workspace.

中文：
添加或修改了什么：为独立演示工作区增加示例学员、课程、课时、目标、摄入记录和复盘。
为什么需要这个文件：让初始教练界面无需真实学员数据或 Azure 部署即可验收。
需要 review 什么：确认示例身份明确，且不会填充至登录后的工作区。

File: `client/src/domain/coachWorkspace.ts`
文件：`client/src/domain/coachWorkspace.ts`

EN:
What was added or changed: Added date helpers, preparation labels, credit arithmetic, effective-target lookup, intake completeness, energy estimation and appointment rules.
Why this file exists: It centralizes shared calculations and protects lesson completion from duplicate credit debits.
What to review: Check date boundaries, historical targets, empty values, conflicting appointments and repeated completion attempts.

中文：
添加或修改了什么：新增日期工具、备赛标签、课时计算、生效目标查询、摄入完整性、热量折算及预约规则。
为什么需要这个文件：集中共享计算，并防止重复完成课程造成重复扣课。
需要 review 什么：检查日期边界、历史目标、空值、课程冲突和重复完成操作。

File: `client/src/domain/coachWorkspace.test.ts`
文件：`client/src/domain/coachWorkspace.test.ts`

EN:
What was added or changed: Added behavior tests for credit debits, insufficient balance, cancellations, appointment overlap, target versions and missing versus zero intake.
Why this file exists: It verifies the data rules most likely to cause incorrect balances or misleading nutrition summaries.
What to review: Confirm the tested outcomes match real coaching rules, particularly exactly one credit debit and preserved historical targets.

中文：
添加或修改了什么：增加扣课、余额不足、取消课程、预约重叠、目标版本及缺失与零摄入的行为测试。
为什么需要这个文件：验证容易导致余额错误或营养摘要误导的关键规则。
需要 review 什么：确认测试结果符合真实教练流程，尤其是单次扣课和历史目标保留。

File: `client/src/store/CoachWorkspaceContext.tsx`
文件：`client/src/store/CoachWorkspaceContext.tsx`

EN:
What was added or changed: Added the workspace provider, browser persistence, selected client and date, validated management actions and storage-error reporting.
Why this file exists: It coordinates coach data updates within the active workspace while keeping the demo and account scopes separate.
What to review: Check account changes, demo exit, reload persistence, unavailable browser storage and the absence of new Azure writes.

中文：
添加或修改了什么：新增工作区 Provider、浏览器保存、选中学员与日期、管理操作校验及保存失败提示。
为什么需要这个文件：统一当前工作区的教练数据更新，并区分演示与账号范围。
需要 review 什么：检查账号切换、离开演示、刷新持久化、浏览器存储不可用及未新增 Azure 写入。

File: `client/src/store/coachWorkspaceState.ts`
文件：`client/src/store/coachWorkspaceState.ts`

EN:
What was added or changed: Separated the shared context identity, workspace value contract and consumer hook from the provider component.
Why this file exists: It keeps workspace consumers consistent across provider reloads and supports explicit workspace-scope handling.
What to review: Check that every coach page uses the intended provider and that account-scope changes never reuse another workspace's state.

中文：
添加或修改了什么：将共享 Context、工作区状态约定和消费 Hook 从 Provider 组件中独立出来。
为什么需要这个文件：保持 Provider 更新时的消费端一致，并支撑明确的工作区归属处理。
需要 review 什么：检查教练页面均使用正确 Provider，账号范围变化时不复用其他工作区状态。

File: `client/src/data/localStorageKeys.ts`
文件：`client/src/data/localStorageKeys.ts`

EN:
What was added or changed: Added an account-specific storage-key helper alongside the existing cache-key constants.
Why this file exists: It keeps personal settings and report identifiers scoped to their known owner without reassigning legacy global caches.
What to review: Check that different accounts produce different keys and that existing global entries are not deleted or silently claimed.

中文：
添加或修改了什么：在原缓存键常量旁增加按账号生成保存键的工具。
为什么需要这个文件：按已知归属隔离个人设置和报告标识，避免把旧全局缓存分配给新账号。
需要 review 什么：检查不同账号的保存键互不相同，旧全局条目不会被删除或默认为当前账号所有。

File: `client/src/store/liftBatteryStore.ts`
文件：`client/src/store/liftBatteryStore.ts`

EN:
What was added or changed: Added account-bound state resets, scoped cache handling and rejection of stale asynchronous results from earlier login sessions.
Why this file exists: It prevents retained personal tools from displaying another account's drafts, records or report state during coach-workspace account changes.
What to review: Check A-to-B switches, logout and same-account relogin while earlier requests are still pending.

中文：
添加或修改了什么：新增账号切换状态重置、按账号保存缓存，以及拦截先前登录会话的异步返回。
为什么需要这个文件：防止保留的个人工具在教练账号切换时展示他人的草稿、记录或报告状态。
需要 review 什么：检查 A 切 B、退出及同账号重新登录时仍在途的旧请求。

File: `client/src/pages/TrendsPage.tsx`
文件：`client/src/pages/TrendsPage.tsx`

EN:
What was added or changed: Scoped restored and saved report-job identifiers to the signed-in account and tolerated unavailable browser storage.
Why this file exists: It preserves trend reporting while preventing report-cache restoration across account boundaries.
What to review: Check same-account report restoration, account changes and normal polling when storage is unavailable.

中文：
添加或修改了什么：按登录账号恢复与保存报告任务标识，并兼容浏览器存储不可用的情况。
为什么需要这个文件：保留趋势报告功能，同时防止跨账号恢复报告缓存。
需要 review 什么：检查同账号报告恢复、账号切换，以及存储不可用时的正常轮询。

File: `client/src/store/accountIsolation.test.ts`
文件：`client/src/store/accountIsolation.test.ts`

EN:
What was added or changed: Added tests for account switches, logout, authentication restoration, stale request results and owner-scoped caches.
Why this file exists: It verifies that the retained personal features cannot carry one account's session data into another.
What to review: Check coverage of the same account logging in again, late profile updates and preservation of legacy cache entries.

中文：
添加或修改了什么：新增账号切换、退出、登录状态恢复、过期请求返回和按归属缓存的测试。
为什么需要这个文件：验证保留的个人功能不会把一个账号的会话数据带入另一个账号。
需要 review 什么：检查同账号重新登录、延迟个人资料更新及旧缓存保留的覆盖情况。
