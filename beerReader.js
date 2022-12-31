let styles = {};
let styleStyle =  [];
let compStyle = [];
	
//Helper for typeahead
var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str.name) || q === "" ) {
        matches.push(str.name);
      }
    });

    cb(matches);
  };
};

function updateHash() {
  let styleName = document.getElementById('styleSelector').value;
  let compName = document.getElementById('compSelector').value;

  if(styleName.trim() == "")
    window.location.href = window.location.href.split('#')[0];
  else
    if(compName)
      window.location.hash = '#style=' + styleName + "&comp=" + compName;
    else
      window.location.hash = '#style=' + styleName;
}


function setStyle(style) {
  let attrList = ['category', 'overallimpression', 'ibumin', 'ibumax', 
                  'abvmin', 'abvmax', 'ogmin', 'ogmax', 
                  'srmmin', 'srmmax', 'number', 'aroma', 'appearance',
                  'flavor', 'mouthfeel', 'history', 'characteristicingredients',
                  'appearance', 'stylecomparison', 'comments', 'commercialexamples',
                  'entryinstructions'];

  for(let attr of attrList) {
    console.log(style[attr])
    if(style[attr] === undefined) {
      $('#'+attr).parent().hide();
    }
    else {
      $('#'+attr).parent().show();
      document.getElementById(attr).innerText = style[attr];
	  styleStyle = style;
    }
  }
  
  document.getElementById("ogbar").replaceChildren(createBar("rangebar", 1.000, 1.1150, style.ogmin, style.ogmax));
  document.getElementById("ibubar").replaceChildren(createBar("rangebar", 0, 100, style.ibumin, style.ibumax));
  document.getElementById("abvbar").replaceChildren(createBar("rangebar", 0, 15, style.abvmin, style.abvmax));
  let srmbar = createBar("rangebar", 0, 32, style.srmmin, style.srmmax);
  srmbar.style.backgroundImage = `linear-gradient(to right, ${getSRMColor(style.srmmin)}, ${getSRMColor(style.srmmax)})`;
  document.getElementById("srmbar").replaceChildren(srmbar);
  updateHash();
}

function clearComp() {
  let compElements = document.getElementsByClassName("comp");
  for(let comp of compElements) {
    comp.style.display = "none";
  }
  updateHash();
}

function setComp(style) {
  let compElements = document.getElementsByClassName("comp");
  for(let comp of compElements) {
    comp.style.display = "revert";
  }

  let attrList = ['ibumin', 'ibumax', 
                  'abvmin', 'abvmax', 
                  'ogmin', 'ogmax', 
                  'srmmin', 'srmmax'];

  for(let attr of attrList) {
    document.getElementById(attr+'Comp').innerText = style[attr];
  }
  document.getElementById("ogbarComp").replaceChildren(createBar("rangebar", 1.000, 1.1150, style.ogmin, style.ogmax));
  document.getElementById("ibubarComp").replaceChildren(createBar("rangebar", 0, 100, style.ibumin, style.ibumax));
  document.getElementById("abvbarComp").replaceChildren(createBar("rangebar", 0, 15, style.abvmin, style.abvmax));

  let srmbar = createBar("rangebar", 0, 32, style.srmmin, style.srmmax);
  srmbar.style.backgroundImage = `linear-gradient(to right, ${getSRMColor(style.srmmin)}, ${getSRMColor(style.srmmax)})`;
  document.getElementById("srmbarComp").replaceChildren(srmbar);
  
  compStyle = style;
  
  updateHash();
}

function swapComp(){
	let styleElement = document.getElementById("styleSelector");
	let compElement = document.getElementById("compSelector");
	let styleName = styleElement.value;
	
	tempStyleStyle= styleStyle;
	styleStyle = compStyle;
	compStyle = tempStyleStyle;
	
	setStyle(styleStyle);
	setComp(compStyle);
	
	document.getElementById("styleSelector").value = styleStyle.name;
	document.getElementById("compSelector").value = compStyle.name;	
}

//Makes a div representing a range
function createBar(classes, min, max, low, high) {
  let el = document.createElement("div");
  el.className = classes;
  let size = max - min;
  let startPoint = (Math.max(low, min) - min) / size;
  let endPoint = (Math.min(high, max) - min) / size;
  el.style.marginLeft = (startPoint * 100) + "%";
  el.style.marginRight = 100 - (endPoint * 100) + "%";
  return el;
}

//Accept SRM value of 1+. Return color based on that value.
//SRM's of 40+ all have same color as 40
function getSRMColor(srmValue) {
  //SRM Codes from https://codepen.io/simonja2/pen/zvGxdG
  const srmCodes = [
    "#F8F5B4",  //1
    "#F9E16C",
    "#F5CF51",
    "#F5C039",
    "#EFAD20",  //5
    "#E49C1A",
    "#E08F17",
    "#D68019",
    "#D3731D", //9
    "#CA6C1E",
    "#C5631B",
    "#C05925",
    "#BE5A1C", //13
    "#AE4919",
    "#AE4719",
    "#AD4418",
    "#A73E16", //17
    "#A33C16",
    "#9E3615",
    "#983013",
    "#922B15", //21
    "#902615",
    "#8A2616",
    "#832114",
    "#7D2012", //25
    "#772111",
    "#731D0C",
    "#72190E",
    "#6B160C", //29
    "#68120B", 
    "#68100E",
    "#600F0A",
    "#5C0C0C", //33
    "#58080A", 
    "#54080D",
    "#4B090B",
    "#4A0F0E", //37
    "#410C0E",
    "#3B0D0F",
    "#240B0B",
  ];

  return srmCodes[Math.min(Math.floor(srmValue), 40) - 1];
}

//Load styles and do setup
fetch("styles.json")
  .then((response) => {
    if (!response.ok) console.error("Issue with request:", response);

    return response.json();
  })
  .then((data) => {

    for (const style of data) {
      styles[style.name] = style;
    }

    $('#styleSelector').typeahead({
      minLength: 0,
      autoselect: true,
      highlight: true
    },
    {
      name: 'style-select',
      limit: Number.MAX_SAFE_INTEGER,
      source: substringMatcher(data)
    }).bind('typeahead:select', (ev, suggestion) => {
      setStyle(styles[suggestion]);
      updateHash();
    });

    $('#compSelector').typeahead({
      minLength: 0,
      autoselect: true,
      highlight: true
    },
    {
      name: 'comp-select',
      limit: Number.MAX_SAFE_INTEGER,
      source: substringMatcher(data)
    }).bind('typeahead:select', (ev, suggestion) => {
      setComp(styles[suggestion]);
      updateHash();
    }).bind('keyup', (ev) => {
      if(ev.key === "Enter" && $('#compSelector').val().trim() === "") {
        $('#compSelector').blur();
        clearComp();
      }
    });
	
    document.getElementById("compSwap").addEventListener("click",swapComp);
	
    let hash = decodeURI(window.location.hash);
    if(hash.trim() !== "") {
      const re = /style=(?<style>[\w ]*)(&comp=(?<comp>[\w ]*))?/;
      let found = hash.match(re);
      if(found.groups['style'] && styles[found.groups['style']]) {
        $('#styleSelector').val(found.groups['style']);
        setStyle(styles[found.groups['style']]);
        lastSelected = found.groups['style'];
        if(found.groups['comp']) {
          $('#compSelector').val(found.groups['comp']);
          setComp(styles[found.groups['comp']]);
          lastComp = found.groups['comp'];
        }
      }
    }

  })
  .catch((error) => {
    console.error("Error:", error);
  });
