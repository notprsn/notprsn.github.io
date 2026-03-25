# QiCAP.Ai

Jun '24 - Nov '25

Quant Trader

## Website copy

- Served as ML Strategy Trader for the firm's medium-frequency index options team, designing data-driven trading strategies on NIFTY and SENSEX index option chain
- Traded a long gamma options strategy that delivered over 3x return on deployed margin within one financial quarter through live runs and continuous performance monitoring
- Integrated ML and statistical techniques, linear and ensemble regressors, forward-return bias modelling, and signal evaluation under normal assumptions to isolate persistent predictive features
- Engineered the firm's most efficient MF backtesting framework using parquet datasets, vectorised computation, and slurm-based parallelisation, cutting simulation runtimes by over 80%
- Automated daily operations of ML black-box deployments and sim-live trading checks across the whole team's active ML strategies with slack updates and helped diagnose and fix mismatches

## Long write-up

I joined QiCAP.Ai in June 2024 as a Quant Trader. The problem statement was to design a profitable strategy to buy ATM straddles on index options on expiry day. They gave me around 750 high frequency data signals at a 5 second frequency as useable input. 

First thing I did was to write a backtesting script that simulates buying and closing of ATM straddles and track the relevant metrics. Buy when the input decision is 2 and exit when its 0. Hold or do nothing when the decision is 1. Keep it simple. 

My first idea was to take the edge values of each signals and check if a 0,1,-1 type probability bayesian update model would work. The problem with this was A. the code was too slow to run and I couldn't figure how to make it faster and B. simplifying real values to discrete space reduced the data information too much to get any predictive power. Scrapped.

Next I generated forward returns for the ATM straddles for different forward look-aheads. I looked at the distributions of these at statistically significant regions of my input signals. Because the number of signals were large, I quantitatively defined different kinds of statistical shapes and labelled my signals based on these shapes. 

I chose the classes of shapes that had good predictive power for different forward look aheads. I looked at the daily price charts of the ATM straddles and concluded that regimes are consistent for quarters or half years at a time. So I trained Random Forest, XGBoost and Linear Models on the chosen signals for each of the look aheads. I tried simple hold for exactly the forward duration trained on and check performance. Linear outperformed exclusively. Learnt to keep it simple when it comes to trading. I trade edges of the model distribution either on Zscore levels or percentile levels.

This exercise took a month and a half. We started trading the strategy and it performed well. Buying options and being right basically means your money doubles, triples, quadruples. It's exhilerating. We were making money hand over fist. Then SEBI changed the rules and BANKNIFTY, MIDCPNIFTY and FINNIFTY weeklys were scrapped. This meant A. I had only 20% days left to trade on and B. I had only 20% of the data to train on. In hindsight this should've been the signal to start afresh but it's human to try to make something continue to work just because it worked so well before. Plus the occasional profitable days kept me attached.

My first pivot was to try using my strategy and other ML black-box signals to continue buying and closing straddles on expiry day. This involved a lot of rust binaries, optimized parallelized code to run sims efficiently. Making dashboards to monitor performance. Coming up with Box-Plot type techniques to justify mathematically, a chosen approach. All hokum, still unprofitable. The lesson to learn here is what system to have to know when to stop running an idea space and when to start it again.

I worked on a side-quest of managing all ML Black Box trading strategies for the firm. This mostly involved making sure our live runs were consistent with what we expected to see in sim. This seemed like a lot of grunt work and making sure the visuals were touching on everything, but it was the beginning getting comfortable with using AI to write all code. I also learnt very useful systems for how to manage the research to execution part of QA. 

The second pivot was a whole new set of signals were introduced thanks to statistical ideas that were natural to build on. This improved the space but I had lost grip on the idea that I had stuck to earlier. I couldn't get myself to rework everything to include the new signals so I kept busy with various side-quests. I regretted not trying a fresh approach with the new information.

I traded my trading approaches to some extent with the rest of the team. I learnt that trading strategies is kind of futile because the consciousness you have spent in designing your own strategy (which is significant intelligent work) can't really be grasped by another. It's better to trade general observations/ideas and let those enrich your trader consciousness. Towards the end of 2025 I realised that it was basically impossible to buy straddles and be profitable from January to June. The lesson here was checking a strategies efficacy through absolute first principles on most recent data is the first step. You should also commit to multiple kinds of strategies because expertise in one doesn't guarantee money forever. It's better to be a jack of all trades (Pun intended).

By this time I was comfortable with coding in english and aware of the fact that I had one year to go before my pre-frontal cortex fuses at 25 and I'm no longer neuroplastic. I decided I've had enough of trading because I chose to do it when I started out for the money and not because it was my calling. I decided to quit and work in AI. Tried to get into an ML role but I wasn't a cultural fit. Decided to bet on myself + AI and take time off to figure out what to do next.
