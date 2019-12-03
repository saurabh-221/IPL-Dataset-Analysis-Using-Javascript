// IPL Dataset
const fcsv = require("fast-csv");
const fs = require("fs");
const print = console.log;
const matchesIn2015 = [];
const matchesPlayedPerYear = {};
const matchesWon = {};
const players = [];
var idInyear16 = []
var idInyear15 = []
const extraRunsConceded = {}
const topTenEconomicBowlers = {}
const noOfBalls = {}

// 1. Number of matches played per year for all the years in IPL.
function matchesPerYear() {
  fs.createReadStream("matches.csv")
    .pipe(fcsv.parse({ headers: true }))
    .on("data", match => {
      if (match.season in matchesPlayedPerYear)
        matchesPlayedPerYear[match.season]++
      else
        matchesPlayedPerYear[match.season] = 1

      if (Number(match.season) === 2016)
        idInyear16.push(match.id)

      if (Number(match.season) === 2015)
        idInyear15.push(match.id)
    })
    .on("end", rowCount => {
      console.log("---------------------------------------------------------------------------------------------------\n\n\n")
      console.log("1. Number of matches played per year for all the years in IPL.\n")
      console.log(matchesPlayedPerYear)
      console.log("\n\n\n---------------------------------------------------------------------------------------------------")
    });
}

//   2. Number of matches won of per team per year in IPL.
function matchesWonPerTeam() {
  fs.createReadStream("matches.csv")
    .pipe(fcsv.parse({ headers: true }))
    .on("data", match => {
      if (match.winner in matchesWon) {
        if (match.season in matchesWon[match.winner])
          matchesWon[match.winner][match.season]++
        else
          matchesWon[match.winner][match.season] = 1
      }
      else {
        matchesWon[match.winner] = {}
        matchesWon[match.winner][match.season] = 1
      }
    })
    .on("end", matchCount => {
      console.log("2. Number of matches won of per team per year in IPL.")
      console.log(matchesWon)
      console.log("\n\n\n---------------------------------------------------------------------------------------------------")
    });
}

//   3. Extra runs conceded per team in 2016
function runConcededInYear16() {
  fs.createReadStream("deliveries.csv")
    .pipe(fcsv.parse({ headers: true }))
    .on("data", delivery => {
      if (idInyear16.includes(delivery.match_id)) {
        if (delivery.bowling_team in extraRunsConceded)
          extraRunsConceded[delivery.bowling_team] += Number(delivery.extra_runs)
        else
          extraRunsConceded[delivery.bowling_team] = Number(delivery.extra_runs)
      }
    })
    .on("end", rowCount => {
      console.log("3. Extra runs conceded per team in 2016")
      console.log(extraRunsConceded)
      console.log("\n\n\n---------------------------------------------------------------------------------------------------")
    });
}

//   4. Top 10 economical bowlers in 2015
function economicalBowlersIn15() {
  fs.createReadStream("deliveries.csv")
    .pipe(fcsv.parse({ headers: true }))
    .on("data", delivery => {
      if (idInyear15.includes(delivery.match_id)) {
        if (delivery.is_super_over !== 1) {
          if (delivery.bowler in topTenEconomicBowlers) {
            topTenEconomicBowlers[delivery.bowler] += Number(delivery.total_runs)
          }
          else {
            topTenEconomicBowlers[delivery.bowler] = Number(delivery.total_runs)
          }

          if (delivery.bowler in noOfBalls) {
            noOfBalls[delivery.bowler] += 1
          }
          else {
            noOfBalls[delivery.bowler] = 1
          }
        }
      }
    })
    .on("end", deliveryCount => {
      for (let i in topTenEconomicBowlers) {
        topTenEconomicBowlers[i] /= (noOfBalls[i] / 6)
      }
      let entries = Object.entries(topTenEconomicBowlers);
      let sorted = entries.sort((a, b) => a[1] - b[1]).slice(0, 11);
      console.log("4. Top 10 economical bowlers in 2015")
      console.log(sorted)
      console.log("\n\n---------------------------------------------------------------------------------------------------")

    });
}

matchesPerYear()
// matchesWonPerTeam()
// runConcededInYear16()
economicalBowlersIn15()