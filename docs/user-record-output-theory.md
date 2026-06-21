# liftBattery User Records, Outputs, and Theory

# liftBattery 用户记录、输出变化与理论依据

---

## 1. Product Direction / 产品方向

### English

liftBattery is not meant to copy enterprise SaaS formulas directly.

It uses a structured input-output system, but the actual tabs and outputs should come from training science concepts:

- session-RPE training load
- RIR/RPE autoregulation
- hard sets
- volume load
- training monotony and strain
- subjective wellness monitoring
- bodyweight trend
- nutrition pressure during cutting phases

The app should help the user answer:

> What did I record today, what output changed, and why might that matter?

### 中文

liftBattery 不应该直接照搬企业 SaaS 的公式。

它可以使用结构化的输入-输出系统，但真正的 tab 和输出应来自训练科学概念：

- session-RPE 训练负荷
- RIR/RPE 自我调节
- hard sets
- volume load
- training monotony 和 strain
- 主观 wellness 监控
- 体重趋势
- 减脂期饮食压力

App 应帮助用户回答：

> 我今天记录了什么，哪些输出发生了变化，为什么这件事可能重要？

---

## 2. Plain-Language Glossary / 术语白话表

### English

This section translates the main sport-science terms into plain product language.

### 中文

这一节把主要运动科学术语翻译成人话，方便你 review 产品逻辑。

| Term / 术语 | Plain meaning / 白话解释 | In liftBattery / 在 liftBattery 里的用途 |
|---|---|---|
| Session RPE | How hard the whole workout felt, usually 1-10. | Used with session duration to estimate internal training load. |
| Session RPE / 训练课 RPE | 整节训练主观有多累，通常 1-10 分。 | 和训练时长一起估算内部训练负荷。 |
| AU / Arbitrary Unit | A relative training-load unit, not kg, not calories. | Lets the app compare training sessions over time. |
| AU / 任意单位 | 相对负荷单位，不是公斤，也不是热量。 | 让 App 比较不同训练课的负荷变化。 |
| RIR / Reps in Reserve | How many more reps the user thinks they could have done. | Used to understand proximity to failure. |
| RIR / 保留次数 | 用户觉得这一组还能多做几次。 | 用来理解接近力竭程度。 |
| RPE for sets | Effort score for a set. RPE 9 often means around 1 rep left. | Used for top-set effort and autoregulation. |
| 组内 RPE | 某一组的努力程度。RPE 9 通常接近还剩 1 次。 | 用于顶组努力程度和自我调节。 |
| Hard set | A challenging working set, usually close enough to failure to count as meaningful training volume. | Used for priority muscle volume. |
| Hard set / 有效训练组 | 有挑战性的正式训练组，通常需要接近力竭才算有意义训练量。 | 用于统计重点肌群训练量。 |
| Volume load | Sets x reps x load. | Used as a workload number for resistance training. |
| Volume load / 总训练量负荷 | 组数 x 次数 x 重量。 | 用作阻力训练工作量指标。 |
| Monotony | Whether load is too similar day after day. | Used to watch low variation in training load. |
| Monotony / 负荷单调性 | 每天训练负荷是不是太接近、太单调。 | 用来观察训练负荷缺少波动。 |
| Strain | Weekly load multiplied by monotony. | Used as a watch signal for high and repetitive weekly stress. |
| Strain / 综合训练压力 | 周负荷乘以单调性。 | 用来观察一周训练压力又高又单调的情况。 |
| Wellness | Subjective state: fatigue, sleep, soreness, stress, mood. | Used as a recovery/readiness proxy. |
| Wellness / 主观状态 | 疲劳、睡眠、酸痛、压力、情绪等主观状态。 | 用作恢复和 readiness 的 proxy。 |
| Proxy | An indirect signal, not exact measurement. | Keeps the app honest when showing recovery or readiness. |
| Proxy / 间接指标 | 间接信号，不是精确测量。 | 防止 App 把恢复或状态说成绝对科学。 |
| Watch state | A flag for review, not a diagnosis or command. | Used for load accumulation, cut pressure, recovery drift. |
| Watch state / 观察状态 | 提醒用户复盘的信号，不是诊断，也不是命令。 | 用于负荷累积、减脂压力、恢复下滑等提醒。 |
| HRV | Heart-rate variability, often used as an autonomic nervous system recovery signal. | Advanced optional wearable input. |
| HRV / 心率变异性 | 心跳间隔变化，常被用作自主神经恢复相关信号。 | 高级可穿戴设备输入。 |
| CMJ | Countermovement jump, a jump test used to monitor neuromuscular status. | Advanced optional gym/coach input. |
| CMJ / 反向跳 | 一种跳跃测试，用于观察神经肌肉状态。 | 高级健身房或教练端输入。 |
| VBT | Velocity-based training, tracking bar speed during lifts. | Advanced strength-performance input. |
| VBT / 速度训练 | 记录杠铃或器械移动速度的训练监控方法。 | 高级力量表现输入。 |

---

## 3. Basic Input to Output Map / 基础输入到输出映射

| User records / 用户记录 | Output affected / 影响输出 | Formula or method / 公式或方法 | Theory basis / 理论依据 |
|---|---|---|---|
| Session RPE + duration / 训练课 RPE + 时长 | Session load, weekly load / 训练课负荷、周负荷 | `session load = RPE x duration` | Session-RPE is commonly used as a simple internal load monitoring method. |
| Daily session loads / 每日训练课负荷 | Monotony, strain / 单调性、strain | `monotony = mean daily load / SD daily load`; `strain = weekly load x monotony` | Load pattern and variation help interpret fatigue risk/watch states. |
| Top set RPE / RIR / 顶组 RPE / RIR | Effort trend, training-mode watch / 努力程度趋势、训练模式观察 | Lower RIR or higher RPE means closer proximity to failure. | RIR-based RPE is used in resistance training autoregulation. |
| Hard sets / Hard sets | Priority volume, weekly volume / 重点训练量、周训练量 | Count challenging sets by muscle group or target area. | Weekly set volume is commonly discussed in hypertrophy research. |
| Sets, reps, load / 组数、次数、重量 | Volume load / 总训练量负荷 | `volume load = sets x reps x load` | Volume load is a common resistance-training workload metric. |
| Fatigue, sleep, soreness, stress, mood / 疲劳、睡眠、酸痛、压力、情绪 | Wellness readiness, recovery watch / wellness 状态、恢复观察 | Trend-based subjective wellness score or proxy. | Athlete self-report measures are commonly used in training monitoring. |
| Bodyweight / 体重 | Bodyweight rate / 体重变化速度 | `rate = change in 7-day average / previous 7-day average` | Useful context during cutting or physique-prep phases. |
| Calories, carbs, hunger / 热量、碳水、饥饿感 | Cut-pressure watch / 减脂压力观察 | Trend or watch label, not a diagnosis. | Nutrition pressure can help interpret training performance and recovery context. |

---

## 4. Real User Scenario / 真实用户使用场景

### Product Principle: Quick Log First / 产品原则：先快速记录

English:

The first version should not ask the user to record everything.

The default daily log should take about 60 seconds:

```txt
1. Session RPE
2. Session duration
3. Fatigue
4. Sleep quality
```

These four inputs already produce useful outputs:

```txt
session load
weekly load
basic wellness readiness
load + recovery watch state
```

Optional inputs unlock more precision:

```txt
Top set RIR
Hard sets
Bodyweight
Hunger
```

Advanced inputs should only appear for users, coaches, or gyms that actually have the data:

```txt
rep velocity
HRV
CMJ
force plate data
```

中文：

第一版不应该让用户记录所有东西。

默认每日记录应该控制在 60 秒左右：

```txt
1. 训练课 RPE
2. 训练时长
3. 疲劳
4. 睡眠质量
```

这四个输入已经能产生有用输出：

```txt
训练课负荷
周负荷
基础 wellness readiness
负荷 + 恢复观察状态
```

可选输入用于提高精度：

```txt
顶组 RIR
Hard sets
体重
饥饿感
```

高级输入只应出现在真正有数据的用户、教练或健身房场景：

```txt
动作速度
HRV
CMJ
力台数据
```

---

### User Profile / 用户画像

English:

User: Maya, 29, serious recreational lifter.

Current block:

```txt
16-week cut
Week 9
Goal: maintain strength and glute/back volume while bodyweight slowly drops
Training: 5 lifting days + 3 cardio sessions per week
```

中文：

用户：Maya，29 岁，认真训练的健身用户。

当前周期：

```txt
16 周减脂周期
第 9 周
目标：体重缓慢下降，同时维持力量和臀/背训练量
训练：每周 5 次力量训练 + 3 次有氧
```

---

### Day 1: Monday Lower Body / 第 1 天：周一下肢训练

Maya quick records:

Maya 快速记录：

```txt
Session RPE: 8
Duration: 75 min
Fatigue: 3/5
Sleep quality: 4/5
```

Optional details if she wants more precision:

如果她想要更高精度，可以补充：

```txt
Top set: Hip thrust 110 kg x 8 @ RPE 9
Top set RIR: 1
Glute hard sets: 8
Bodyweight: 67.4 kg
Hunger: 3/5
```

App outputs:

App 输出：

```txt
session load = 8 x 75 = 600 AU
top set effort = high, because RPE 9 / RIR 1
optional priority hard sets = 8 glute hard sets
wellness readiness = okay
cut pressure = manageable
watch state = no major warning
```

Plain meaning:

白话解释：

Maya trained hard, but sleep and fatigue still look acceptable. The app does not tell her to deload. It simply records that Monday was a high-stimulus lower-body day.

Maya 训练很用力，但睡眠和疲劳还可以。App 不会让她 deload，只是记录周一是一个高刺激下肢训练日。

---

### Day 2: Tuesday Upper Body / 第 2 天：周二上肢训练

Maya quick records:

Maya 快速记录：

```txt
Session RPE: 7
Duration: 70 min
Fatigue: 3/5
Sleep quality: 3/5
```

Optional:

```txt
Top set: Pull-up +15 kg x 6 @ RPE 8
Top set RIR: 2
Back hard sets: 9
```

App outputs:

App 输出：

```txt
session load = 7 x 70 = 490 AU
effort = moderate-high, because RPE 8 / RIR 2
priority volume = on plan
weekly load total so far = 1,090 AU
wellness readiness = slightly lower
watch state = normal tracking
```

Plain meaning:

白话解释：

The session is productive but not maximal. RIR 2 means she had about two reps left, so the top set was challenging without being an all-out grind.

这节训练有效，但不是极限。RIR 2 表示大约还剩 2 次，说明顶组有挑战但不是硬顶到极限。

---

### Day 3: Wednesday Cardio + Low Sleep / 第 3 天：周三有氧 + 睡眠下降

Maya quick records:

Maya 快速记录：

```txt
Session RPE: 5
Duration: 40 min cardio
Fatigue: 4/5
Sleep quality: 2/5
```

Optional:

```txt
Steps: 12,500
Bodyweight: 66.9 kg
Hunger: 4/5
```

App outputs:

App 输出：

```txt
session load = 5 x 40 = 200 AU
weekly load total = 1,290 AU
wellness readiness = down
cut pressure = rising
recovery watch = mild
```

Why this matters:

为什么重要：

The workout load is not high, but fatigue and poor sleep are already enough to lower readiness. If Maya also tracks hunger and bodyweight, the app can add cut-pressure context.

训练负荷本身不高，但疲劳和睡眠差已经足够让 readiness 下降。如果 Maya 也记录饥饿感和体重，App 可以进一步加入减脂压力语境。

---

### Day 4: Thursday Performance Drop / 第 4 天：周四表现下降

Maya quick records:

Maya 快速记录：

```txt
Session RPE: 9
Duration: 80 min
Fatigue: 5/5
Sleep quality: 2/5
```

Optional:

```txt
Top set: Romanian deadlift 95 kg x 6 @ RPE 10
Top set RIR: 0
Planned target: 95 kg x 8 @ RPE 8-9
Hamstring/glute hard sets: 7
Hunger: 4/5
```

App outputs:

App 输出：

```txt
session load = 9 x 80 = 720 AU
top set effort = very high, because RPE 10 / RIR 0
performance signal = down, because reps missed target
wellness readiness = low
load accumulation watch = active
```

Plain meaning:

白话解释：

The app does not say "you are overtrained." It says:

App 不会说“你过度训练了”。它会说：

```txt
High effort + missed reps + poor sleep + high fatigue appeared together.
Review tomorrow's load before adding more hard sets.

高努力程度 + 次数低于目标 + 睡眠差 + 高疲劳同时出现。
明天加训练量前，先 review 负荷。
```

This is a watch state, not a diagnosis.

这是观察状态，不是诊断。

---

### Day 5: Friday Adjustment / 第 5 天：周五调整

Maya quick records:

Maya 快速记录：

```txt
Session RPE: 6
Duration: 55 min
Fatigue: 4/5
Sleep quality: 3/5
```

Optional:

```txt
Top set RIR: 3
Priority hard sets: 6 instead of planned 10
Cardio: skipped
```

App outputs:

App 输出：

```txt
session load = 6 x 55 = 330 AU
effort = lower, because RIR 3
priority volume = below plan today
weekly strain = still high, but no longer rising as fast
recovery watch = improving
```

Plain meaning:

白话解释：

Maya did not "fail the plan." She adjusted load after several signals stacked up. The app should make this feel like intelligent training management, not guilt.

Maya 不是“计划失败”。她是在多个信号叠加后调整负荷。App 应让这件事像聪明的训练管理，而不是制造愧疚。

---

### Weekly Summary / 每周总结

At the end of the week, liftBattery summarizes:

一周结束后，liftBattery 总结：

```txt
Weekly load = 3,980 AU
Monotony = 1.9
Strain = 7,562
Priority hard sets = 45 / 48 planned
Volume load = 42,600 kg
Bodyweight rate = -0.7% / week
Wellness readiness = down 8 points
Main watch state = Load Accumulation Watch
Secondary watch state = Cut Pressure Watch
```

Plain-language interpretation:

白话解释：

```txt
You completed most priority training volume.
你的重点训练量基本完成。

But training load rose while sleep and fatigue worsened.
但训练负荷上升，同时睡眠和疲劳变差。

Bodyweight is dropping at a reasonable pace, but hunger is rising.
体重下降速度还算合理，但饥饿感上升。

Next week, review cardio and optional volume before adding more hard sets.
下周增加 hard sets 前，先 review 有氧和可选训练量。
```

What changed because of user records:

用户记录导致哪些输出变化：

| Recorded input / 记录输入 | Output changed / 输出变化 | Why / 为什么 |
|---|---|---|
| RPE 9 x 80 min | Session load rose to 720 AU | High RPE plus long duration creates high internal load. |
| RPE 9 x 80 分钟 | 训练课负荷升到 720 AU | 高 RPE 加较长时长会产生高内部负荷。 |
| RIR 0 | Effort watch activated | RIR 0 means the top set reached failure or near failure. |
| RIR 0 | 努力程度观察激活 | RIR 0 表示顶组达到或接近力竭。 |
| Sleep 2/5 + fatigue 5/5 | Wellness readiness dropped | Multiple subjective recovery signals worsened. |
| 睡眠 2/5 + 疲劳 5/5 | Wellness readiness 下降 | 多个主观恢复信号变差。 |
| Bodyweight down + hunger 4/5 | Cut pressure watch stayed active | The cut is progressing, but perceived diet pressure is rising. |
| 体重下降 + 饥饿 4/5 | 减脂压力观察保持激活 | 减脂在推进，但主观饮食压力上升。 |
| Hard sets 45 / 48 | Priority volume stayed near plan | Main training stimulus was mostly completed. |
| Hard sets 45 / 48 | 重点训练量接近计划 | 主要训练刺激基本完成。 |

This scenario shows the full product loop:

这个场景展示了完整产品闭环：

```txt
daily records
-> formulas and proxies
-> trend outputs
-> watch states
-> weekly review
-> better next-week decision
```

```txt
每日记录
-> 公式和 proxy
-> 趋势输出
-> 观察状态
-> 每周复盘
-> 更好的下周决策
```

The key product decision:

关键产品决策：

```txt
Do not show all fields on day one.
第一天不要展示所有字段。

Start with four quick inputs.
先从 4 个快速输入开始。

Add optional fields only when the user wants more precision.
只有用户想要更高精度时才增加可选字段。

Reserve advanced metrics for premium gym / coach / wearable contexts.
高级指标留给高级健身房、教练端或可穿戴设备场景。
```

---

## 5. Output Definitions / 输出定义

### Session Load / 训练课负荷

English:

Session load is the simplest internal training-load output.

```txt
session load = session RPE x session duration in minutes
```

If the user records RPE 8 and trains for 75 minutes:

```txt
8 x 75 = 600 AU
```

This is useful for seeing how hard the session felt relative to its duration.

中文：

训练课负荷是最简单的内部训练负荷输出。

```txt
训练课负荷 = session RPE x 训练时长（分钟）
```

如果用户记录 RPE 8，并训练 75 分钟：

```txt
8 x 75 = 600 AU
```

它用于观察一节训练课在主观强度和时长结合后的负荷大小。

Theory basis / 理论依据:

- Session-RPE method: <https://pmc.ncbi.nlm.nih.gov/articles/PMC5673663/>
- Training load and fatigue review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4213373/>

---

### Weekly Load, Monotony, and Strain / 周负荷、单调性和 Strain

English:

Weekly load summarizes total training stress across the week.

```txt
weekly load = sum of daily session loads
monotony = mean daily load / standard deviation of daily load
strain = weekly load x monotony
```

If weekly load rises and monotony also rises, the app can show a watch state such as:

```txt
Load Accumulation Watch
```

中文：

周负荷总结一周训练压力。

```txt
周负荷 = 每日训练课负荷总和
monotony = 每日负荷均值 / 每日负荷标准差
strain = 周负荷 x monotony
```

如果周负荷上升，同时 monotony 也上升，App 可以显示：

```txt
负荷累积观察
```

Theory basis / 理论依据:

- Training load and fatigue review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4213373/>
- Session-RPE method: <https://pmc.ncbi.nlm.nih.gov/articles/PMC5673663/>

---

### Effort / RIR / 努力程度 / RIR

English:

RIR means repetitions in reserve.

```txt
RIR 3 = probably 3 reps left
RIR 1 = probably 1 rep left
RIR 0 = no reps left / failure
```

Lower RIR or higher RPE indicates the set is closer to failure.

This affects:

- effort trend
- training-mode watch
- fatigue-cost interpretation
- top-set quality review

中文：

RIR 指还能保留几次。

```txt
RIR 3 = 大约还能做 3 次
RIR 1 = 大约还能做 1 次
RIR 0 = 无保留 / 力竭
```

RIR 越低，或 RPE 越高，说明该组越接近力竭。

它会影响：

- 努力程度趋势
- 今日训练模式观察
- 疲劳成本解释
- 顶组质量复盘

Theory basis / 理论依据:

- RIR-based RPE scale: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4961270/>
- Methods for regulating and monitoring resistance training: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7706636/>

---

### Volume and Volume Load / 训练量与 Volume Load

English:

liftBattery should separate volume into:

- priority stimulus
- support work

Do not call this enterprise Core / Non-Core unless it helps the user. The training concept is more direct:

```txt
volume load = sets x reps x load
priority share = priority hard sets / total hard sets
```

These outputs help users see whether their training stress is coming from the work that matters most, or from extra support work.

中文：

liftBattery 应把训练量分成：

- 重点刺激
- 支持性训练

不需要强行叫企业式 Core / Non-Core。训练语境里更直接的说法是：

```txt
volume load = 组数 x 次数 x 重量
重点占比 = 重点 hard sets / 总 hard sets
```

这些输出帮助用户判断训练压力来自真正重要的训练，还是来自额外支持性训练。

Theory basis / 理论依据:

- Volume load example: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4215195/>
- Weekly volume and hypertrophy meta-analysis: <https://pubmed.ncbi.nlm.nih.gov/27433992/>

---

### Wellness Readiness / Wellness 状态

English:

Wellness readiness is a proxy, not a diagnosis.

It may use:

- fatigue
- sleep quality
- soreness
- stress
- mood
- hunger in cutting context

When fatigue and soreness rise while sleep and mood fall, the app may show:

```txt
Recovery Watch
```

It should not say:

```txt
You are overtrained.
You have a disease.
You must deload.
```

中文：

Wellness 状态是 proxy，不是诊断。

它可以使用：

- 疲劳
- 睡眠质量
- 酸痛
- 压力
- 情绪
- 减脂语境下的饥饿感

当疲劳和酸痛上升，同时睡眠和情绪下降时，App 可以显示：

```txt
恢复观察
```

不应该说：

```txt
你过度训练了。
你有疾病。
你必须 deload。
```

Theory basis / 理论依据:

- Athlete self-report monitoring review: <https://pubmed.ncbi.nlm.nih.gov/26423706/>

---

### Nutrition and Cut Pressure / 饮食与减脂压力

English:

Nutrition outputs should explain context, not prescribe extreme dieting.

Useful records:

- bodyweight
- calories
- carbs
- hunger
- cardio

Useful outputs:

```txt
bodyweight rate
cut-pressure watch
training quality context
```

中文：

饮食相关输出应解释语境，而不是给极端节食建议。

有用记录：

- 体重
- 热量
- 碳水
- 饥饿感
- 有氧

有用输出：

```txt
体重变化速度
减脂压力观察
训练质量语境
```

Theory basis / 理论依据:

- Natural bodybuilding contest preparation context: <https://pmc.ncbi.nlm.nih.gov/articles/PMC5769537/>

---

## 6. Advanced Formula Candidates / 高级公式候选

### English

These are more advanced formulas that a premium gym, sport-performance center, or serious coaching product might use.

Important:

- Some require extra hardware.
- Some are better for athletes than casual lifters.
- Some are controversial if used for injury prediction.
- In liftBattery, these should be labelled as advanced, proxy, watch, or estimate.

### 中文

下面这些是高级健身房、运动表现中心或严肃教练产品可能使用的高级公式。

重要：

- 有些需要额外设备。
- 有些更适合运动员，不一定适合普通健身用户。
- 有些如果用于预测伤病会有争议。
- 在 liftBattery 里应标注为 advanced、proxy、watch 或 estimate。

---

### 6.1 Velocity Loss / 速度损失

Use case / 使用场景:

- Advanced strength gym
- Powerlifting / strength training
- Hypertrophy blocks where fatigue inside a set matters
- Requires bar-speed sensor, camera, or velocity device

Formula:

```txt
velocity loss % = (fastest rep velocity - last rep velocity) / fastest rep velocity x 100
```

中文公式：

```txt
速度损失 % = (最快一次速度 - 最后一次速度) / 最快一次速度 x 100
```

What user records / 用户记录：

- exercise
- load
- rep velocity for each rep
- best rep velocity
- last rep velocity

Output changed / 输出变化：

- set fatigue
- proximity-to-failure estimate
- stop-set recommendation watch
- fatigue cost of volume

Why it is marketable / 为什么有市场：

- Feels high-tech.
- Gives immediate feedback during sets.
- Can power premium gym displays and coach dashboards.

为什么有市场：

- 看起来更高科技。
- 一组训练中就能给即时反馈。
- 适合高级健身房大屏、私教端和运动表现中心。

Boundary / 边界：

Velocity loss is useful, but it is not a direct measurement of hypertrophy or recovery.

速度损失有用，但不是肌肥大或恢复的直接测量。

Theory basis / 理论依据:

- Velocity-based resistance training review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8822898/>
- VBT and mean concentric velocity review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7739360/>

---

### 6.2 Estimated 1RM from Load-Velocity Relationship / 用负荷-速度关系估算 1RM

Use case / 使用场景:

- Strength athletes
- Advanced gyms with VBT devices
- Users who should not max out frequently

Simple model:

```txt
velocity = slope x load + intercept
estimated 1RM load = (minimal velocity threshold - intercept) / slope
```

中文公式：

```txt
速度 = 斜率 x 重量 + 截距
估算 1RM = (最低速度阈值 - 截距) / 斜率
```

Plain meaning / 白话解释：

If the same user moves the same lift slower as the load gets heavier, you can draw a personal line between load and bar speed. The app can estimate the load where bar speed would reach that user's minimal 1RM velocity.

如果同一个人在同一个动作中，重量越重速度越慢，就可以画出个人“重量-速度”关系线。App 可以估算当速度降到该用户 1RM 最低速度附近时，对应的重量是多少。

Output changed / 输出变化：

- estimated 1RM
- daily strength readiness estimate
- load prescription estimate
- performance trend

Boundary / 边界：

This depends heavily on exercise, device accuracy, technique consistency, and individual calibration.

它非常依赖动作、设备准确性、技术一致性和个人校准。

Theory basis / 理论依据:

- Load-velocity prediction systematic review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC9612483/>
- Individualized load-velocity meta-analysis: <https://pmc.ncbi.nlm.nih.gov/articles/PMC10432349/>

---

### 6.3 HRV Readiness Z-Score / HRV Readiness 标准分

Use case / 使用场景:

- Premium gym with wearable integration
- Recovery tracking
- Morning readiness check

Formula:

```txt
HRV z-score = (today lnRMSSD - baseline mean lnRMSSD) / baseline SD
```

中文公式：

```txt
HRV 标准分 = (今日 lnRMSSD - 基线 lnRMSSD 均值) / 基线标准差
```

Plain meaning / 白话解释：

Compare today's HRV with the user's own normal range. A lower-than-normal value may be a recovery watch signal, especially if fatigue is also high.

把今天的 HRV 和用户自己的正常范围比较。如果明显低于平时，同时疲劳也高，可以作为恢复观察信号。

Output changed / 输出变化：

- recovery watch
- readiness proxy
- stress/recovery context

Boundary / 边界：

HRV is noisy. It should be interpreted with sleep, fatigue, illness, alcohol, menstrual cycle, travel, and stress context.

HRV 波动很大。应结合睡眠、疲劳、生病、饮酒、月经周期、旅行和压力一起看。

Theory basis / 理论依据:

- HRV and training systematic review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8107721/>
- HRV biofeedback systematic review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7386140/>

---

### 6.4 CMJ Neuromuscular Readiness / CMJ 神经肌肉状态

Use case / 使用场景:

- Athletic performance center
- Team sport gym
- Advanced lower-body fatigue monitoring
- Requires jump mat, force plate, or validated phone/camera approach

Simple formula:

```txt
CMJ readiness z-score = (today jump height - baseline mean jump height) / baseline SD
```

中文公式：

```txt
CMJ readiness 标准分 = (今日跳高 - 基线跳高均值) / 基线标准差
```

Advanced force-plate outputs:

```txt
RSI modified = jump height / time to takeoff
eccentric braking impulse = force x time during braking phase
```

中文：

```txt
改良 RSI = 跳高 / 起跳用时
离心制动冲量 = 制动阶段力量 x 时间
```

Output changed / 输出变化：

- neuromuscular readiness
- lower-body fatigue watch
- power output trend

Boundary / 边界：

CMJ results can be affected by motivation, warm-up, technique, device, and test consistency.

CMJ 结果会受到动机、热身、技术、设备和测试一致性的影响。

Theory basis / 理论依据:

- CMJ neuromuscular status meta-analysis: <https://www.sciencedirect.com/science/article/pii/S1440244016301542>

---

### 6.5 EWMA Acute:Chronic Load Ratio / EWMA 急性:慢性负荷比

Use case / 使用场景:

- Load management dashboard
- Team sport or serious hybrid athlete context
- Better as a "load spike watch" than injury prediction

Formula:

```txt
EWMA today = load today x alpha + EWMA yesterday x (1 - alpha)
alpha = 2 / (N + 1)
AC ratio = acute EWMA / chronic EWMA
```

中文公式：

```txt
今日 EWMA = 今日负荷 x alpha + 昨日 EWMA x (1 - alpha)
alpha = 2 / (N + 1)
急性:慢性负荷比 = 急性 EWMA / 慢性 EWMA
```

Plain meaning / 白话解释：

This compares recent load with the user's longer-term load base. If recent load rises much faster than the longer-term base, the app can show a load-spike watch.

它比较近期负荷和长期负荷基础。如果近期负荷比长期基础上升得太快，App 可以显示负荷突增观察。

Output changed / 输出变化：

- load spike watch
- weekly review flag
- progression pacing context

Boundary / 边界：

ACWR is controversial, especially for injury prediction. In liftBattery, it should be a workload-context signal, not an injury-risk engine.

ACWR 有争议，尤其不适合包装成伤病预测。在 liftBattery 中它应只是负荷语境信号，不是伤病风险引擎。

Theory basis / 理论依据:

- ACWR systematic review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7047972/>
- ACWR scientific-evidence editorial: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8138569/>
- EWMA formula example in ACWR meta-analysis: <https://pmc.ncbi.nlm.nih.gov/articles/PMC12487117/>

---

### 6.6 Fitness-Fatigue Model / Fitness-Fatigue 模型

Use case / 使用场景:

- High-end coaching analytics
- Endurance or hybrid athletes
- Longitudinal performance modelling

Simplified model:

```txt
performance estimate = baseline + fitness effect - fatigue effect
```

More formal version:

```txt
performance(t) = baseline + k1 x fitness(t) - k2 x fatigue(t)
```

中文公式：

```txt
表现估计 = 基线 + 适应收益 - 疲劳影响
```

更正式版本：

```txt
表现(t) = 基线 + k1 x 适应(t) - k2 x 疲劳(t)
```

Plain meaning / 白话解释：

Training creates both fitness and fatigue. Fitness usually builds and fades more slowly; fatigue rises and falls faster. The model tries to estimate the net result.

训练同时带来适应和疲劳。适应通常建立和消退更慢；疲劳上升和下降更快。这个模型试图估算两者相减后的结果。

Output changed / 输出变化：

- performance estimate
- taper planning
- fatigue-versus-fitness view

Boundary / 边界：

This needs a lot of history and calibration. It should not be used as an exact prediction in Phase 1.

它需要大量历史数据和个人校准。Phase 1 不应当成精确预测使用。

Theory basis / 理论依据:

- Training impulse and fitness-fatigue context: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4213373/>
- Impulse-response model example: <https://pmc.ncbi.nlm.nih.gov/articles/PMC12880663/>

---

### 6.7 Set Density / 训练密度

Use case / 使用场景:

- Busy lifters
- Hypertrophy classes
- Gym products that want a simple "work per time" metric

Formula:

```txt
set density = hard sets / session duration
volume-load density = volume load / session duration
```

中文公式：

```txt
训练组密度 = hard sets / 训练时长
volume-load 密度 = volume load / 训练时长
```

Output changed / 输出变化：

- training density
- session pacing
- fatigue-pressure context

Boundary / 边界：

Higher density is not automatically better. Some strength work needs longer rest.

训练密度更高不一定更好。有些力量训练需要更长休息。

Market note / 市场卖点：

This is easy for users to understand and does not require expensive hardware.

这个指标用户容易理解，也不需要昂贵硬件。

---

### 6.8 Muscle-Specific Volume Response / 肌群级训练量反应

Use case / 使用场景:

- Serious hypertrophy tracking
- Natural bodybuilding prep
- Premium coaching review

Formula idea:

```txt
muscle response = change in performance + soreness trend + pump/connection score + recovery trend
```

中文公式思路：

```txt
肌群反应 = 表现变化 + 酸痛趋势 + 泵感/目标肌肉控制感 + 恢复趋势
```

Volume context:

```txt
muscle weekly hard sets compared with personal low / normal / high volume zones
```

中文：

```txt
肌群每周 hard sets 对比个人低 / 正常 / 高训练量区间
```

Output changed / 输出变化：

- muscle-specific volume watch
- possible under-stimulated muscle watch
- possible recovery-crowding watch

Boundary / 边界：

This is a coaching heuristic. It should not claim to measure muscle growth directly.

这是教练启发式框架，不能宣称直接测量肌肉增长。

Theory basis / 理论依据:

- Weekly volume and hypertrophy meta-analysis: <https://pubmed.ncbi.nlm.nih.gov/27433992/>

---

### 6.9 Advanced Readiness Composite / 高级综合 Readiness

Use case / 使用场景:

- Premium product tier
- Gym dashboard
- Coach review summary

Possible formula:

```txt
readiness composite =
  0.25 x wellness z-score
+ 0.20 x HRV z-score
+ 0.20 x CMJ z-score
+ 0.20 x performance trend
- 0.15 x acute load spike
```

中文公式：

```txt
综合 readiness =
  0.25 x wellness 标准分
+ 0.20 x HRV 标准分
+ 0.20 x CMJ 标准分
+ 0.20 x 表现趋势
- 0.15 x 急性负荷突增
```

Boundary / 边界：

The weights are product design choices, not universal science. The UI must say configurable proxy.

这些权重是产品设计选择，不是统一科学。UI 必须标注为可配置 proxy。

Market note / 市场卖点：

This feels premium because it can combine wearable data, gym test data, and self-report data into one coach-review panel.

它有高级感，因为可以把可穿戴数据、健身房测试数据和主观自评合并到一个教练复盘面板。

---

## 7. Which Advanced Formulas Are Worth Adding First / 哪些高级公式优先加入

### English

Recommended order:

1. Set Density
   Easy to understand and no extra hardware.

2. Velocity Loss
   Strong market appeal for serious lifters if VBT data is available.

3. HRV Readiness Z-Score
   Useful if wearable integration is planned.

4. Muscle-Specific Volume Response
   Strong fit for hypertrophy and prep users.

5. EWMA Load Spike Watch
   Useful, but must avoid injury-prediction claims.

6. CMJ Readiness
   Best for gyms with jump mats, force plates, or athletic-performance setups.

7. Fitness-Fatigue Model
   Powerful but data-hungry and easy to overclaim.

### 中文

推荐加入顺序：

1. 训练密度
   容易理解，不需要额外硬件。

2. 速度损失
   对认真力量训练者很有市场吸引力，前提是有 VBT 数据。

3. HRV Readiness 标准分
   如果未来接入可穿戴设备，很有用。

4. 肌群级训练量反应
   非常适合增肌和备赛用户。

5. EWMA 负荷突增观察
   有用，但必须避免伤病预测宣称。

6. CMJ Readiness
   最适合有跳垫、力台或运动表现测试的健身房。

7. Fitness-Fatigue 模型
   很强，但非常吃历史数据，也很容易过度宣称。

---

## 8. What Should Change in the UI / UI 应该如何变化

### English

The UI should reduce broad SaaS vocabulary such as:

- utilisation
- productivity
- efficiency
- capacity
- forecast

Use more direct training science tabs:

- Daily Log
- Training Load
- Effort / RIR
- Volume
- Recovery
- Nutrition
- Trends
- Weekly Review

The app can still keep a structured system:

```txt
record input
-> derive training output
-> show trend
-> show watch state
-> guide weekly review
```

### 中文

UI 应减少宽泛 SaaS 词汇，例如：

- utilisation
- productivity
- efficiency
- capacity
- forecast

改用更直接的训练科学 tab：

- Daily Log / 每日记录
- Training Load / 训练负荷
- Effort / RIR / 努力程度
- Volume / 训练量
- Recovery / 恢复
- Nutrition / 饮食压力
- Trends / 趋势
- Weekly Review / 每周复盘

App 仍然可以保留结构化系统：

```txt
记录输入
-> 派生训练输出
-> 展示趋势
-> 展示观察状态
-> 引导每周复盘
```

---

## 9. Boundary / 边界

### English

liftBattery should not claim:

- medical diagnosis
- overtraining diagnosis
- RED-S diagnosis
- exact muscle growth measurement
- exact recovery capacity measurement
- extreme dieting recommendation
- PED or drug advice

Use language such as:

- proxy
- trend
- watch
- context
- review
- may suggest

### 中文

liftBattery 不应宣称：

- 医学诊断
- 过度训练诊断
- RED-S 诊断
- 精确肌肉增长测量
- 精确恢复容量测量
- 极端节食建议
- PED 或药物建议

使用这类语言：

- proxy
- trend
- watch
- context
- review
- 可能提示
