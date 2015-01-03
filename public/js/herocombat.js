window.spdChart = {
  segmentToSpeed: {
    0: [2,3,4,5,6,7,8,9,10,11,12],
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
    0: [1,2,3,4,5,6,7,8,9,10,11,12],
    1: [7],
    2: [6,12],
    3: [4,8,12],
    4: [3,6,9,12],
    5: [3,5,8,10,12],
    6: [2,4,6,8,10,12],
    7: [2,4,6,7,9,11,12],
    8: [2,3,5,6,89,11,12],
    9: [2,3,4,6,7,8,10,11,12],
    10: [2,3,4,5,6,8,9,10,11,12],
    11: [2,3,4,5,6,7,8,9,10,11,12],
    12: [1,2,3,4,5,6,7,8,9,10,11,12]
  }
  
}

window.activeSlots = [
  [], [], [],
  [], [], [],
  [], [], [],
  [], [], []
]


function loadLocalFile(name) 
{

    var fileNames = $("#" + name);
    for(var i = 0; i < fileNames[0].files.length; i++) {
        var file = fileNames[0].files[i];
        var reader = new FileReader();

        reader.onloadend = function(e) {
            var parser = new DOMParser();
            var sheet = parser.parseFromString(e.target.result, 'application/xml');
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

        reader.readAsText(file);

    }
}


function displayFile(name, dex, spd) {
  var c = '<tr><td>' + name + '</td><td>' + spd + '</td><td>' + dex + '</td></tr>';

  $(c).appendTo('#combatsheet');
}

function addToActive(name, dex, spd) {
  for(var s=0; s < window.spdChart.speedToSegment[spd].length; s++) {
    var seg = window.spdChart.speedToSegment[spd][s];
    window.activeSlots[seg] = insertSheet(window.activeSlots[seg],
      {name: name, dex: dex});
  }
}

function displayAllSegments() {
  for (var s = 1; s < 13; s++) {
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


function addToRecentList(name, dex, spd)
{
    if(localStorage!= null)
    {
        var list = localStorage['recentList'];
        if(list == null){
          list = [];
        }
        
        localStorage['recentList'] = list;
    }

}

function insertSheet(array, obj)
{
  var newList = [];
  if(array == null){
    newList = [{'name': obj.name, 'dex': obj.dex, 'spd':obj.spd}];
  }else{
     var counter = 0;
     while(counter < array.length && array[counter].dex > obj.dex){
      newList.push(array[counter++]);
    }
  
     newList.push({'name': obj.name, 'dex': obj.dex, 'spd':obj.spd});
     while(counter < array.length)
     {
       newList.push(array[counter++]);
     }
  }
  return newList
}
