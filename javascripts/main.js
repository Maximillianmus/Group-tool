// Load data from file 

d3.tsv("SanitizedData.tsv", conversor, function(data){
  addVisTool(data);
  initShowcasedDonut();
  initGroupHandler();

  // Adds tooltip
  d3.select("body")
   .append("div")
   .attr("id", "tooltip")
   .attr("style", "position: absolute; opacity: 0;");
});


// Create dummy data for local testing.
var data = [
  {Alias: "Erik", Interests: "Boardgames, Sports, Boardgames, Sports, Boardgames, Sports, Boardgames, Sports", Ambition: "Manager", Canvas: "Yes", Social: "Yes", Facebook: "Yes", CompSkill: 10, ProgSkill: 2, RepSkill: 2, InfoSkill: 2, ArtSkill: 2, GrapSkill: 2, HCISkill: 2, UEvalSkill: 2, MathSkill: 2, StatSkill: 2, CollabSkill: 2, CommSkill: 2},
  {Alias: "Max", Interests: "Drawing, Politics", Ambition: "Developer", Canvas: "No", Social: "No", Facebook: "Yes", CompSkill: 8, ProgSkill: 10, RepSkill: 2, InfoSkill: 2, ArtSkill: 2, GrapSkill: 2, HCISkill: 2, UEvalSkill: 2, MathSkill: 2, StatSkill: 2, CollabSkill: 2, CommSkill: 2}
];

//number filter array
var filter_num = []
const interests = ["All","Reading", "Boardgames", "Sports", "Music", "Design", "Cooking","Gardening","Crafts","Photography", "Gaming", "Drawing", "Politics","Traveling","Movies"]
const ambition = ["All","Entrepreneur","Manager", "Academia","Developer","Consultant"]
const communication = ["All","Facebook", "Social", "Canvas"]
const numeric_cats = {CompSkill: "Computer Knowledge", ProgSkill: "Programming", RepSkill: "Repository",  GrapSkill: "Graphic Programming", InfoSkill: "Info Visualization", ArtSkill: "Artistic", HCISkill: "HCI Programming", UEvalSkill: "User Exp. Evaluation", CollabSkill: "Collaberation", CommSkill: "Communication",  StatSkill: "Statistics",  MathSkill: "Mathematics"}
var current_drop = {Interests : "All", Ambition : "All", Communication : "All"}

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["CompSkill", "ProgSkill", "RepSkill",  "InfoSkill", "ArtSkill", "GrapSkill",  "HCISkill",    "UEvalSkill", "MathSkill", "StatSkill", "CollabSkill", "CommSkill"])
  .range(["DarkBlue",   "Blue",      "turquoise", "Green", "DarkGreen",    "LightGreen",  "Greenyellow" ,  "Gold",    "DarkMagenta",  "Magenta",    "Orange",       "Red"]);

// variables that handles selected person and groups
var groupValues = {CompSkill: 0, ProgSkill: 0, RepSkill: 0,  GrapSkill: 0, InfoSkill: 0, ArtSkill: 0, HCISkill: 0, UEvalSkill: 0, CollabSkill: 0, CommSkill: 0,  StatSkill: 0,  MathSkill: 0};
var currentGroup = [];
var grouped_members = [];
var selectedChart = null;
var allGroups = [];

// Dimensions and margins of the donutcharts.
const width = 100
    height = width
    margin = 10


const swidth = 200, sheight = 200, smargin = 10;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width, height) / 2 - margin
const sradius = Math.min(swidth, sheight) / 2 - smargin

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)
  .outerRadius(radius)

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; });

// FOR LOCAL TESTING
/*
addVisTool(data)
initShowcasedDonut()
initGroupHandler()

d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .attr("style", "position: absolute; opacity: 0;");
*/


initfilter()
function initfilter(){
  addFilterDropdown(interests, "Interests")
  addFilterDropdown(ambition, "Ambition")
  addFilterDropdown(communication, "Communication")
  const keys = Object.keys(groupValues)
  keys.forEach((key, i)=>{
    addSlider(numeric_cats[key], i);
  });
}

function addFilterDropdown(options, id){
  var dropdowndiv = d3.select(".dropdowncontainer").append("div");
  dropdowndiv.append("h4").classed("dropdownTitle", true).text(id);
  var dropdown = dropdowndiv.append("select").attr("id", id);

  dropdown.data(options)
  .selectAll('myOptions')
    .data(options)
  .enter()
  .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button


    dropdown.on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value");
      // run the updateChart function with this selected option
      current_drop[id] = selectedOption;
      filter()
  })
}

function addSlider(titel, i){
  var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var divSlider = d3.select(".container").append("div").classed("row align-items-center", true);
  divSlider.append("h4").classed("divSliderTitle", true).text(titel);
  divSlider.append("div").classed("col-sm-2", true).append("p").attr("id", "value-simple"+i);
  divSlider.append("div").classed("col-sm", true).append("div").attr("id", "slider-simple"+i);
  filter_num.push(1);


  var sliderSimple = d3
    .sliderBottom()
    .min(d3.min(data))
    .max(d3.max(data))
    .width(180)
    .tickFormat(d3.format('.2'))
    .ticks(10)
    .step(1)
    .default(1)
    .on('onchange', val => {
      filter_num[i] = val;
      filter()
    });

  var gSimple = d3
    .select('div#slider-simple'+i)
    .append('svg')
    .attr('width', 220)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);
  }

function addVisTool(data){
  const width_w = 800, height_w = 600
  d3.select("#charts")
    .append("svg")
    .attr("id", "container")
    .attr("width", width_w)
    .attr("height", height_w)
    .style("outline", "solid black")
    .style("background-color", "floralwhite");

  var svg = d3.select("#container")
  .call(d3.zoom().on("zoom", function () {
    svg.attr("transform", d3.event.transform)
    }))
    .append("g");

  let x = 0, y = 0;
  for (let i = 0; i < data.length; i++) {
    // Add group
    svg.append("g")
      .attr("id", "g"+i)
      .attr("transform", "translate(" + x + "," + y+")");
      x += width;
      if(x == width*8){
        y += height;
        x = 0
      }

    // Add chart to that group
      var chartData = pie(d3.entries(data[i]));
      addChart(chartData, i)
  }
}

// Adds a donut chart
function addChart(chartData, i){
  // append the svg object to the div called 'charts'
  var svg = d3.select("#g"+i)
    .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "chart" + i)
      .on("click", () => selectDonut(i))
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('allSlices')
    .data(chartData)
    .enter()
    .append('path')
     .attr('d', arc)
     .attr('fill', function(d){
       return(color(d.data.key))
      })
     .style("opacity", 0.8)

     .on("mouseover", function(d){
        d3.select("#tooltip")
         .style("opacity", 1)
         .style("background", "lightgrey")
         .text(numeric_cats[d.data.key] + " " + d.data.value);
      })

      .on("mouseout",function(d){
        d3.select('#tooltip').style('opacity', 0)
      })

      .on('mousemove', function() {
        d3.select('#tooltip')
        .style('left', (d3.event.pageX+20) + 'px').
        style('top', (d3.event.pageY-20) + 'px')
        });

  svg
    .append("svg:circle")
    .attr("id", "fadeoutCircle"+i)
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 0)
    .style("fill", "white")
    .style("opacity", 0.8)
}

// Handles what happens when you select a donut
function selectDonut(chartNumber){
  deSelectDonut();

  d3.select("#chart" + chartNumber)
   .classed("selected", true)
   .style("outline", "solid red");

  selectedChart = chartNumber;
  d3.select("#gSelectDonut").style("display", "block");


  d3.tsv("SanitizedData.tsv", conversor, function(data){
    presentDonutInfo(data[chartNumber]);
    showcaseDonut(pie(d3.entries(data[chartNumber])));
  });
  

  //FOR LOCAL TESTING
  //presentDonutInfo(data[chartNumber]);
  //showcaseDonut(pie(d3.entries(data[chartNumber])));
}

// Removes border from selected donut
function deSelectDonut(){
  d3.select(".selected")
  .classed("selected", false)
  .style("outline", "none");

  selectedChart = null;
}

// Makes data ints and not string
function conversor(d){
  d.CompSkill = +d.CompSkill;
  d.ProgSkill = +d.ProgSkill;
  d.RepSkill = +d.RepSkill;
  d.InfoSkill = +d.InfoSkill;
  d.ArtSkill = +d.ArtSkill;
  d.GrapSkill = +d.GrapSkill;
  d.HCISkill = +d.HCISkill;
  d.UEvalSkill = +d.UEvalSkill;
  d.MathSkill = +d.MathSkill;
  d.StatSkill = +d.StatSkill;
  d.CommSkill = +d.CommSkill;
  d.CollabSkill = +d.CollabSkill;
  return d;
}


function filter(){
 
  var unfilter = true;
  const keys = Object.keys(groupValues);
  d3.tsv("SanitizedData.tsv", conversor, function(data){
    
    for (let i = 0; i < data.length; i++) {
      unfilter = true
      keys.forEach(function(key, index){
      if (data[i][key] < filter_num[index]) {
      unfilter = false 
     }
     });
     //WORD filtering
     if (current_drop["Interests"] != "All"){
      var inter = data[i]["Interests"].split(", ")
      if (!inter.includes(current_drop["Interests"])) {
        unfilter = false
      }  

     }
     if (current_drop["Ambition"] != "All"){
      var inter = data[i]["Ambition"]
      
      if (inter != current_drop["Ambition"]) {
        unfilter = false
      }  
     }
     if (current_drop["Communication"] != "All"){
      var communication = data[i][current_drop["Communication"]]
      if (communication == "No"){
        unfilter = false
      }
     }


     if (unfilter && !(grouped_members.includes(i))) {
      d3.select("#fadeoutCircle"+i).transition().duration(200).attr("r", 0);
     }
     if(!unfilter){
      d3.select("#fadeoutCircle"+i).transition().duration(200).attr("r", radius);
     }
    };
  });
  
}

// Adds element where selected donut is presented
function initShowcasedDonut(){

  var div = d3.select("#selectedDonut");

  div.append("svg")
    .attr("width", swidth)
    .attr("height", sheight)
    .append("g")
      .attr("transform", "translate(" + swidth / 2 + "," + sheight / 2 + ")")
      .attr("id", "gSelectDonut");
  
  // For information about selected chart.
  var div2 = div.append("div")
    .attr("id", "selectedInformation");
   div2.append("p").attr("id","selectedInterests").classed("selectedInfoText",true);
   div2.append("p").attr("id","selectedAmbition").classed("selectedInfoText",true);
   div2.append("p").attr("id","selectedCommunication").classed("selectedInfoText",true);

  // Add button so one can add selected chart to group
  div.append("button")
    .attr("id", "addToGroupButton")
    .text("Add to group")
    .attr("onclick", "addToGroup()");
}

// Adds information about selected donut
function presentDonutInfo(data){
  d3.select("#selectedAlias").text(data["Alias"]);  
  d3.select("#selectedInterests").text("Interests: " + data["Interests"]);
  d3.select("#selectedAmbition").text("Ambition: " + data["Ambition"]);
  var com = "Communication: ";
  var tmp = false;
  if(data["Canvas"] == "Yes"){
    com += "Canvas";
    tmp = true;
  }
  if(data["Social"] == "Yes"){
    if(tmp){
      com += ", ";
    }
    com += "Social";
  }
  if(data["Facebook"] == "Yes"){
    if(tmp){
      com += ", ";
    }
    com += "Facebook";
  }
  d3.select("#selectedCommunication").text(com);
}

// Handles the chart that showcases the selected donut
function showcaseDonut(data){
  var u = d3.select("#gSelectDonut").selectAll("path").data(data);

  u
   .enter()
   .append('path')
   .merge(u)
   .style("opacity", 0.8)
   .on("mouseover", function(d){
    d3.select("#tooltip")
     .style("opacity", 1)
     .style("background", "lightgrey")
     .text(numeric_cats[d.data.key] + " " + d.data.value);
    })
   .on("mouseout",function(d){
    d3.select('#tooltip').style('opacity', 0)
    })
  .on('mousemove', function() {
    d3.select('#tooltip')
    .style('left', (d3.event.pageX+20) + 'px').
    style('top', (d3.event.pageY-20) + 'px')
    })
   .transition()
   .duration(1000)
   .attr('d', d3.arc()
     .innerRadius(sradius * 0.5)
     .outerRadius(sradius)
   )
   .attr('fill', function(d){return(color(d.data.key))});
}

// Sets upp the groupHandler
function initGroupHandler(){
  div = d3.select("#groupHandler");

  // Svg where group chart is presented
  div.append("svg")
    .attr("width", swidth)
    .attr("height", sheight)
    .append("g")
      .attr("transform", "translate(" + swidth / 2 + "," + sheight / 2 + ")")
      .attr("id", "gGroupHandler");

  // Div where groupmembers are listed
  div.append("p")
    .attr("id", "groupMembers");
  
   // Button where you complete selcted group
   div.append("button")
    .attr("id", "completeGroupButton")
    .text("Complete Group")
    .attr("onclick", "completeGroup()");
}

// Adds currently selected chart to group
function addToGroup(){
  if(selectedChart != null && !(grouped_members.includes(selectedChart))){
    console.log(selectedChart)
    // add currently selected chart to grouplist
    currentGroup.push(selectedChart);
    grouped_members.push(selectedChart);
    // fade out the chart from selector
    d3.select("#fadeoutCircle"+selectedChart).attr("r",radius);
    // Hide selected chart
    d3.select("#gSelectDonut").style("display", "none");
    
    // Remove text
    d3.select("#selectedAlias").text("");
    // Remove info
    d3.select("#selectedAmbition").text("");
    d3.select("#selectedCommunication").text("");
    d3.select("#selectedInterests").text("");

    d3.tsv("SanitizedData.tsv", conversor, function(data){
      showGroup(data)
    });
    
    // for local testing
    //showGroup(data);

    deSelectDonut();
  }
}

// Showcases group total
function showGroup(data){
  var groupmembers = "Current Members: "
  const keys = Object.keys(groupValues);
  // Reset groupValues
  keys.forEach((key)=>{
    groupValues[key] = 0;
  });

  // Add all values from each groupmember to groupValues
  for (let i = 0; i < currentGroup.length; i++) {
    keys.forEach(function(key){
      groupValues[key] += data[currentGroup[i]][key]
      console.log(groupValues);
    });
    groupmembers += data[currentGroup[i]]["Alias"] + ", ";
  }
  d3.select("#groupMembers").text(groupmembers.substring(0, groupmembers.length -2))

  var u = d3.select("#gGroupHandler").selectAll("path").data(pie(d3.entries(groupValues)));

  u
  .enter()
  .append('path')
  .merge(u)
  .style("opacity", 0.8)
  .on("mouseover", function(d){
    d3.select("#tooltip")
    .style("opacity", 1)
    .style("background", "lightgrey")
    .text(numeric_cats[d.data.key] + " " + d.data.value);
    })
  .on("mouseout",function(d){
    d3.select('#tooltip').style('opacity', 0)
    })
  .on('mousemove', function() {
    d3.select('#tooltip')
    .style('left', (d3.event.pageX+20) + 'px').
    style('top', (d3.event.pageY-20) + 'px')
    })
  .transition()
  .duration(1000)
  .attr('d', d3.arc()
    .innerRadius(sradius * 0.5)
    .outerRadius(sradius)
  )
  .attr('fill', function(d){return(color(d.data.key))});

  d3.select("#gGroupHandler").style("display", "block");
}

// completes the group
function completeGroup(){
    if(currentGroup.length != 0){
    // New entry for current group
    allGroups.push([]);
    // Save members in new entry
    currentGroup.forEach(member => {
      allGroups[allGroups.length-1].push(member);
    });
    // Reset current group and its values
    currentGroup = [];
    const keys = Object.keys(groupValues)
    keys.forEach((key)=>{
      groupValues[key] = 0;
    });
    d3.select("#gGroupHandler").style("display", "none");
    d3.select("#groupMembers").text("");
  }
}