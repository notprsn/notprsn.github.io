# sharpely (neam caps pvt. ltd.)

i joined sharpely in september 2023. i'd just spent two months mildly dissociated and deeply unemployed: applying to jobs, writing to professors, giving the gre, and travelling around india with my family after not getting a permanent offer at optiver. nobody was hiring. linkedin, sensing weakness, knew i'd bite.

they were tiny: ceo, cto, frontend engineer, backend engineer, money guy.

the hiring project was to build a backtester, run a simple bollinger-band crossover strategy on it and add visuals. fun project.

my first assignment as an intern was to speed up a stock screener by replacing its pandas logic with polars. polars is awesome. absurdly fast. the syntax, unfortunately, is a nightmare.

i'd isolate logical blocks in pandas, rewrite them in polars, then keep comparing input and output dataframes until they matched. chatgpt still sucked at ingesting documentation and returning reliable syntax back then, so this involved considerably more reading than prompting.

next came dx-charts, an open-source charting library meant to replace their paid tradingview components. the funny part was that their frontend engineer had already tried integrating it, decided the documentation was hopeless and given up.

nobody told me.

so i kept going until it worked.

him admitting afterwards that he hadn't managed to do it himself was a much-needed little ego refill.

i also built data pipelines for bulk deals, block deals, insider trades and corporate actions directly from nse and bse endpoints. pull the data, clean it, map it to the existing database schema, push it to production.

roughly one pipeline a day. test it. ship it.

the last bullet on my resume from sharpely is mostly a gimmick.

i pushed a bunch of pdfs through hugging face models and got unusable garbage back. i also explored integrating lean as a possible front-facing backtesting framework, which went nowhere. there was c# and .net code i barely understood, and i think i eventually forked the repository and set up a toy strategy that bought s&p 500 components at close and sold them at the next open.

i'm drawing a blank even trying to remember why.

the role wasn't all-consuming, which left me enough spare brain to do other things. vineet and i worked on a proof of concept for carseekho: standardising driving schools in india, starting with mumbai.

we also applied to e-cell at iitb. they killed the idea at the idea stage.

somewhere in this window, i also completed a 6000-piece jigsaw puzzle.

productive quarter.
