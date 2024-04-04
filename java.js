const overAll = [
  "PF:newApp:test1:v2:htebhiaet.config",
  "PF:newApp:test1:v2:sphjie.config",
  "PF:newApp:test1:v1:sphjie.WF",
  "PF:newApp:test1:v1:processFlowSummary",
  "PF:newApp:test1:v2:processFlow",
  "listt",
  "TORUS:Group-1:DF:asaweqeqwe:qweqweqwe:PF:v1:relationship",
  "TORUS:Group-1:DF:asaweqeqwe:qweqweqwe:v1:edges",
  "TORUS:Group-1:DF:asaweqeqwe:qweqweqwe:v1:nodes",
];
const dd = [
  "PF:newApp:test1:v2:processFlowSummary", //done exact
  "PF:newApp:test1:v1",
  "TORUS", //done parent
  "listt", //done parent & exact
];
var final = [];
for (let i = 0; i < dd.length; i++) {
  for (let j = 0; j < overAll.length; j++) {
    if (overAll[j] == dd[i]) {
      final = [...final, dd[i]];
      break;
    }
  }

  if (dd[i].includes(":")) {
    var temp = dd[i].split(":");
    // console.log("temp", temp);
    for (let j = 0; j < overAll.length; j++) {
      if (overAll[j].includes(":")) {
        var temp2 = overAll[j].split(":");
        // console.log("temp2", temp2);
        for (let k = 0; k < temp2.length; k++) {
          if (temp2[k] == temp[k]) {
            // console.log("called");
            if (temp.length - 1 == k) {
              final = [...final, overAll[j]];
              break;
            }
            // k++;
            continue;
          }
          break;
        }
      }
    }
  } else {
    for (let j = 0; j < overAll.length; j++) {
      var temp = overAll[j].split(":");
      if (temp[0] == dd[i]) final = [...final, overAll[j]];
    }
  }
}

let uniqueArray = final.filter((item, index) => {
  return final.indexOf(item) === index;
});

console.log(uniqueArray);
