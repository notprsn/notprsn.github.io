# QiCAP.Ai

I joined QiCAP.Ai in June 2024 as a Quant Trader. The initial problem statement was simple to describe and solve: design a profitable strategy to buy ATM straddles on index options on expiry day. I was given about 750 high-frequency signals sampled every five seconds as usable input.

I wrote a backtesting script that simulated buying and closing ATM straddles while tracking the relevant metrics. Buy when the decision is 2, exit when it is 0, hold when it is 1. Keep it simple.

My first trading idea was to take the edge values of each signal and see whether a 0, 1, -1 style Bayesian update model would work. Two problems killed it. First, the code was too slow and I couldn't make it fast enough. Second, collapsing real values into discrete buckets threw away too much information. Scrapped.

Next I generated forward returns for ATM straddles across different look-aheads. I studied their distributions in statistically significant regions of the input signals. Because the number of signals was large, I defined different kinds of statistical shapes and labelled signals accordingly.

I chose the classes of shapes that had predictive power across different look-aheads. I looked at daily ATM-straddle charts and concluded that regimes tend to stay consistent for quarters or half-years at a time. So I trained random forests, XGBoost, and linear models on the chosen signals for each look-ahead. I then tried the simplest possible deployment logic: hold for exactly the forward duration the model was trained on and check performance. Linear models outperformed everything else. Good reminder that simplicity is underrated in trading. I ended up trading the edges of the model distribution using z-score and percentile levels.

That whole exercise took about a month and a half. We started trading the strategy and it worked. Buying options and being right means your money can double, triple, or quadruple. It is exhilarating. We were making money hand over fist. Then SEBI changed the rules and BANKNIFTY, MIDCPNIFTY, and FINNIFTY weekly expiries went kaput. That meant I had only a fraction of the trading days left and only a fraction of the data to train on. In hindsight, that should have been the sign to start afresh. Instead, like most humans, I tried to keep something alive just because it had once worked beautifully.

My first pivot was to keep buying and closing straddles on expiry day using my strategy plus other ML black-box signals. That involved a lot of Rust binaries, optimized parallel code for faster sims, dashboards for performance monitoring, and box-plot-style techniques to mathematically justify chosen approaches. A lot of it felt like hokum. It was still unprofitable. The lesson was about systems: how do you know when to stop exploring an idea space and when to restart from first principles?

I also spent time managing ML black-box trading strategies across the firm. That mostly meant making sure live runs matched what we expected to see in sim. It looked like grunt work on the surface, but it was where I started getting comfortable with AI-assisted coding and with the research-to-execution QA loop.

The second pivot came when a new set of signals arrived, built on some natural extensions of our statistical thinking. The space improved, but by then I had lost some grip on the original idea. I did not fully rework the system around the new signals and I regret that. I kept busy with side-quests instead of committing to a clean rebuild.

I also learned that sharing fully formed trading strategies is somewhat futile. The consciousness you build while designing your own strategy is too much of the edge; another person rarely absorbs it by inheritance. It is better to trade observations and mental models than finished strategies. By late 2025 I had also realized that buying straddles profitably was basically impossible from January to June. That reinforced a more basic lesson: test a strategy against first principles on the most recent data before you fall in love with it. And never assume one profitable style will make money forever.

By then I was comfortable coding in English and increasingly aware that I wanted to move closer to AI than discretionary strategy research. I explored that direction seriously and started thinking harder about what I wanted the next phase of work to look like. It's said your prefrontal-cortex gets close to full development when you turn 25 so a year to sprint on other skills felt like a good idea. Let's see if this bet pays off.
