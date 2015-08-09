var CLIENT_ID = 'AIzaSyDIUNom2lbiwofsjYBZTzVX7EEcf39mNVg';
var SCOPES = 'https://www.googleapis.com/auth/drive';

$().gdrive('init', {
    'devkey': 'AIzaSyA7VrgyNvdOlORTXgxG_pvViiUJ7A1_oQY',
    'appid':''
});



window.spdChart = {
  segmentToSpeed: {
    0: [2,3,4,5,6,7,8,9,10,11,12], // This is actually segment 12
    1: [12],
    2: [6,7,8,9,10,11,12],
    3: [4,5,8,9,10,11,12],
    4: [3,6,7,9,10,11,12],
    5: [5,8,10,11,12],
    6: [2,4,6,7,8,9,10,11,12],
    7: [1,7,9,11,12],
    8: [3,5,6,8,9,10,11,12],
    9: [4,7,8,10,11,12],
    10: [5,6,9,10,11,12],
    11: [7,8,9,10,11,12]},

  speedToSegment: {
    0: [0,1,2,3,4,5,6,7,8,9,10,11], // This is actually speed 12
    1: [7],
    2: [6,0],
    3: [4,8,0],
    4: [3,6,9,0],
    5: [3,5,8,10,0],
    6: [2,4,6,8,10,0],
    7: [2,4,6,7,9,11,0],
    8: [2,3,5,6,8,9,11,0],
    9: [2,3,4,6,7,8,10,11,0],
    10: [2,3,4,5,6,8,9,10,11,0],
    11: [2,3,4,5,6,7,8,9,10,11,0],
    12: [1,2,3,4,5,6,7,8,9,10,11,0]
  }
  
}

window.activeSlots = [
  [], [], [],
  [], [], [],
  [], [], [],
  [], [], []
]


function loadLocalFile(name) {

    var fileNames = $("#" + name);
    for(var i = 0; i < fileNames[0].files.length; i++) {
        var file = fileNames[0].files[i];
        var reader = new FileReader();

        reader.onloadend = function(e) {
            parseHDCharacter(e.target.result);
        }

        reader.readAsText(file);

    }
}

function parseHDCharacter(body) {

   var parser = new DOMParser();
   var sheet = parser.parseFromString(body, 'application/xml');
   var name = sheet.evaluate('string(//CHARACTER_INFO/@CHARACTER_NAME)', sheet, null,
     XPathResult.STRING_TYPE, null).stringValue;
   var dex = 10 + sheet.evaluate('number(//CHARACTERISTICS/DEX/@LEVELS)',
     sheet, null, XPathResult.NUMBER_TYPE, null).numberValue;

   var spd = (1 + (dex/10 | 0)) + sheet.evaluate('number(//CHARACTERISTICS/SPD/@LEVELS)',
     sheet, null, XPathResult.NUMBER_TYPE, null).numberValue;

   addToRecentList(name, dex, spd);
   addToActive(name, dex, spd);
   displayFile(name, dex, spd);
   displayAllSegments();

}

function loadGDriveFile(api, id) {

}

function loadFileFromWeb(url){

}

function displayFile(name, dex, spd) {
  var c = '<tr><td>' + name + '</td><td>' + spd + '</td><td>' + dex + '</td></tr>';

  $(c).appendTo('#combatsheet');
}

function addToActive(name, dex, spd) {
   var spdIdx = spd % 12;
  for(var s=0; s < window.spdChart.speedToSegment[spdIdx].length; s++) {
    var seg = window.spdChart.speedToSegment[spdIdx][s];

    if(window.activeSlots[seg] == null) {
        window.activeSlots[seg] = [];
    }

    window.activeSlots[seg].push({name: name, spd: spd, dex: dex})
    window.activeSlots[seg].sort(compareValues);
  }
}

function displayAllSegments() {
  for (var s = 0; s < 12; s++) {
     var phase = window.activeSlots[s];
     $('#seg' + s + 'body').empty();
     if(phase.length >0 ) {
       for(var p =0; p < phase.length; p++) {
          var c = '<tr><td>&nbsp;</td><td>' + phase[p].name + '</td><td>' + phase[p].dex + '</td></tr>';
          $(c).appendTo('#seg' + s + 'body');
       }
     $('#seg' + s).show();
   } else {
       $('#seg' + s).hide();

   }
  }
}

function addToRecentList(name, dex, spd) {
  if(localStorage!= null) {
    var list = localStorage['recentList'];
    if(list == null) {
      list = [];
    }
        
    localStorage['recentList'] = list;
  }

}

function compareValues(a, b) {
   return  (b.dex * 100 + b.spd) - (a.dex * 100 + a.spd);
}

function startCombat(e) {

  if(localStorage != null) {
    var startingPhase = 0;

    for(var i = 1; i < 13; i++) {
      var segIdx = i % 12;
      if(window.activeSlots[segIdx] != undefined && window.activeSlots[segIdx].length > 0) {
        if(startingPhase ==0) {
          startingPhase = segIdx;
        } else {
          $("#seg" + segIdx).toggle();
        }
      }
    }
    localStorage['currentPhase'] = startingPhase;


    $(document).keypress(nextPhase);
    $("#startCombat").prop("disabled", true)
  }


}


function nextPhase(e) {
  if(localStorage != null) {
    if(e.charCode ==13 || e.charCode == 32) {

      var phase = parseInt(localStorage['currentPhase']);

      localStorage['currentPhase'] = phase;
      $("#seg" + phase).toggle();
      phase = (phase + 1) % 12;
      while(window.activeSlots[phase].length == 0){
        phase = (phase + 1) % 12;
      }
      $("#seg" + phase).toggle();
      localStorage['currentPhase'] = phase;
    }
  }

}

