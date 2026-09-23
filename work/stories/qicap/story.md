# qicap.ai

i joined qicap.ai in june 2024 as a quant trader. the first problem was satisfyingly contained: build a profitable strategy for buying atm straddles on index-option expiry days. i was handed roughly 750 high-frequency signals, sampled every five seconds, and told to have at it.

first i built the simulator. buy when the decision is 2, exit when it's 0, hold when it's 1. track the relevant metrics. keep it simple.

my first idea was less simple. take the edge values of each signal and try a 0, 1, -1-style bayesian update model. two things killed it. the code was too slow and i couldn't make it fast enough; worse, discretising real-valued signals threw away too much information. scrapped.

next i generated forward atm-straddle returns across different look-aheads and studied their distributions in statistically significant regions of each signal. 750 signals is an annoying number of graphs to stare at, so i defined statistical shapes, classified signals by shape, and kept the classes that showed predictive power across horizons.

looking through daily atm-straddle charts, i noticed regimes seemed to persist for quarters or half-years at a time. i trained random forests, xgboost and linear models on the selected signals for each look-ahead, then tried an almost offensively simple deployment rule: if a model predicts a horizon, hold for exactly that long.

linear models won. (surprise!)

i ended up trading the edges of their output distributions using z-scores and percentile levels. the whole thing took about a month and a half. then we put it live.

it worked.

buying options on expiry while being right is ridiculously fun. your money can double, triple, quadruple. for a while we were making it hand over fist.

then sebi changed the rules. banknifty, midcpnifty and finnifty weekly expiries went kaput. overnight, i had a fraction of the trading days and a fraction of the useful training data.

in hindsight, this was probably the part where i had to understand the game has changed.

instead i tried to keep it alive.

the first pivot kept the expiry-day straddle framework alive while adding other ml black-box signals. this spawned rust binaries, aggressively parallel sims, performance dashboards and box-plot-style machinery to mathematically justify various choices. a lot of it felt like hokum. importantly, it was also still unprofitable.

there's a systems question buried in there that i care about much more now: when are you exploring a promising idea space, and when are you merely refusing to restart?

around the same time, i was managing ml black-box strategies across the firm, mostly making sure live behaviour matched sim. it looked like grunt work. it ended up being useful exposure to the research-to-execution qa loop, and was where i first became comfortable coding with ai.

the second pivot came when we got a new family of signals built from natural extensions of the statistical ideas we'd started with. the space was better. my research wasn't. by then i'd lost some grip on the original thesis, didn't properly rebuild the system around the new information, and kept myself occupied with side quests instead.

i regret that.

i also became increasingly convinced that handing someone a fully formed trading strategy is futile. the edge lives in the consciousness you build while creating it: what you've tested, what you've ruled out, which assumptions bother you, what looks wrong before you can quite prove why. observations and mental models transfer. finished strategies mostly don't. does this mean i agree with [tao](https://mathstodon.xyz/@tao/117207849921390904)?

by late 2025 i'd also learnt that buying straddles profitably was basically impossible for us from january through june. another embarrassingly basic lesson: test the idea against first principles on recent data before falling in love with its historical pnl. one profitable style is not a law of nature.

somewhere through all this, i got really comfortable coding in english and increasingly interested in what i could do without being told what to.

so i left myself a year to sprint in that direction.

let's see if this bet pays off.
