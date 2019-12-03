// 4. Top 10 economical bowlers in 2015

const fcsv = require("fast-csv");
const fs = require("fs");
const log = console.log;

const matchesIn2015 = [];
const economicalBowlers = {};
const sortedEconomicalBowlers = [];

const keyInJsonArray = (arr, key) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id == key) {
      return i;
    }
  }
  return -1;
};

fs.createReadStream("matches.csv")
  .pipe(fcsv.parse({ headers: true }))
  .on("data", row => {
    if (row.season == 2015) {
      matchesIn2015.push(row);
    }
  })
  .on("end", rowCount => {
    // log(matchesIn2015);
    fs.createReadStream("deliveries.csv")
      .pipe(fcsv.parse({ headers: true }))
      .on("data", row => {
        const matchIndex = keyInJsonArray(matchesIn2015, row.match_id);

        if (matchIndex !== -1) {
          if (!parseInt(row.is_super_over)) {
            if (!economicalBowlers[row.bowler]) {
              economicalBowlers[row.bowler] = {
                totalBalls: 0,
                totalWideBalls: 0,
                totalNoBalls: 0,
                totalByeRuns: 0,
                totalLegByeRuns: 0,
                totalRuns: 0
              };
            } else {
              economicalBowlers[row.bowler]["totalBalls"]++;
              economicalBowlers[row.bowler]["totalWideBalls"] +=
                row.wide_runs > 0 ? parseInt(row.wide_runs) : 0;
              economicalBowlers[row.bowler]["totalNoBalls"] +=
                row.noball_runs > 0 ? parseInt(row.noball_runs) : 0;
              economicalBowlers[row.bowler]["totalByeRuns"] +=
                row.bye_runs > 0 ? parseInt(row.bye_runs) : 0;
              economicalBowlers[row.bowler]["totalLegByeRuns"] +=
                row.legbye_runs > 0 ? parseInt(row.legbye_runs) : 0;
              economicalBowlers[row.bowler]["totalRuns"] +=
                row.total_runs > 0 ? parseInt(row.total_runs) : 0;
            }
          }
        }
      })
      .on("end", rowCount => {
        // log(economicalBowlers);
        for (let bowler in economicalBowlers) {
          economicalBowlers[bowler]["totalValidBalls"] =
            economicalBowlers[bowler]["totalBalls"] -
            (economicalBowlers[bowler]["totalWideBalls"] +
              economicalBowlers[bowler]["totalNoBalls"]);
          economicalBowlers[bowler]["economy"] =
            (economicalBowlers[bowler]["totalRuns"] -
              (economicalBowlers[bowler]["totalByeRuns"] +
                economicalBowlers[bowler]["totalLegByeRuns"])) /
            (economicalBowlers[bowler]["totalBalls"] / 6);
          sortedEconomicalBowlers.push([
            bowler,
            economicalBowlers[bowler]["economy"]
          ]);
        }
        log(sortedEconomicalBowlers.sort((a, b) => a[1] - b[1]).slice(0, 10));
      });
  });
