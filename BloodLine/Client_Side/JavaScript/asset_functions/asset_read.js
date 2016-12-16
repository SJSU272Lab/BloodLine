function loadAssets()
{
	/*
	Retrieves all V5Cs from the blockchain and formats the data to display on a web page. Need the address of the account
	executing this request, at the moment this is hard coded in the html for each page.
	*/
	var found = 0;
	var posLast = 0;
	var objects = [];
	var error = false;
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "/blockchain/assets/samples", true)
	xhr.overrideMimeType("text/plain");
	xhr.onprogress = function () {
		var data = xhr.responseText;
		var array = data.split("&&");

		for(var i = 0; i < array.length; i++)
		{
			if(array[i].trim() != "")
			{
				var obj = JSON.parse(array[i]);
				var found = false;

				for(var j = 0; j < objects.length; j++)
				{
					if(objects[j].bloodID == obj.bloodID)
					{
						found = true;
						break;
					}
				}
				if(!found)
				{
					if(pgNm == "Regulator")
					{
						if(obj.status == 0)
						{
							obj.BIN = '&lt;<i>BIN</i>&gt;';
							obj.type = '&lt;<i>type</i>&gt;';
							obj.HIV = '&lt;<i>HIV</i>&gt;';
							obj.name = '&lt;<i>name</i>&gt;';
							obj.date = '&lt;<i>date</i>&gt;';
							objects.push(obj);
						}
					}
					else
					{
						if(typeof obj.message == 'undefined' && obj.BIN > 0 && obj.type.toLowerCase() != 'undefined' && obj.type.trim() != '' && obj.HIV.toLowerCase() != 'undefined' && obj.HIV.trim() != '' && obj.date.toLowerCase() != 'undefined' && obj.date.trim() != '' && obj.name.toLowerCase() != 'undefined' && obj.name.trim() != '' && !obj.consumed)
						{
							objects.push(obj)
						}
					}
					if(obj.hasOwnProperty("error"))
					{
						error = true
						$("#vhclsTbl").append("Unable to load assets.");
					}
				}
			}
		}
		var plu = 'samples';
		if(objects.length == 1)
		{
			plu = 'sample';
		}
		$('.numFound').html(objects.length + ' ' + plu);
	}
	xhr.onreadystatechange = function (){
		if(xhr.readyState === 4)
		{
			if(!error)
			{
				$("#vhclsTbl").empty();
				for(var i = 0; i < objects.length; i++)
				{
					var data = objects[i];
					$("#vhclsTbl").append("<tr class='vehRw'><td class='vin'>"+data.BIN+"</td><td class='vehDets' ><span class='carInfo'>" + data.type + "</span><span class='carInfo'>" + data.HIV + ", </span><span class='carInfo'>" + data.name + ", </span><span class='carInfo'>" + data.date + "</span></td><td class='chkHldr'><span class='chkSpc' ></span><span class='chkBx' ></span><input class='isChk' type='hidden' value='false' /><input class='bloodID' type='hidden' value='"+data.bloodID+"' /></td></tr>");
				}
				changeBarSize();
			}
		}
	}
	xhr.send()
}

function loadUpdateAssets()
{
	/*
	Retrieves all V5Cs from the blockchain and formats the data to display on a web page. Need the address of the account
	executing this request, at the moment this is hard coded in the html for each page.
	*/
	var found = 0;
	var posLast = 0;
	var objects = [];
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "/blockchain/assets/samples", true)
	xhr.overrideMimeType("text/plain");
	xhr.onprogress = function () {
		var data = xhr.responseText;
		var array = data.split("&&");

		for(var i = 0; i < array.length; i++)
		{
			if(array[i].trim() != "")
			{
				var obj = JSON.parse(array[i]);
				var found = false;
				for(var j = 0; j < objects.length; j++)
				{
					if(objects[j].bloodID == obj.bloodID)
					{
						found = true;
						break;
					}
				}

				console.log("UPDATE ASSET READ:", obj)

				if(!found && typeof obj.message == 'undefined')
				{
					objects.push(obj)
				}
			}
		}
		var plu = 'samples';
		if(objects.length == 1)
		{
			plu = 'sample';
		}
		$('#loaderMessages').html(objects.length + ' ' + plu);
	}
	xhr.onreadystatechange = function (){
		if(xhr.readyState === 4)
		{
			var d = objects;
			$('#loader').hide();
			$('#fade').hide();
			for(var i = 0; i < d.length; i++)
			{
				var data = d[i];
				if(data.BIN == 0) data.BIN = '&lt;<i>BIN</i>&gt;';
				//console.log("Bin Value:", data.BIN)
				/*if(data.BIN == 0){
					console.log("Bin Value:", data.BIN)
					data.BIN = '&lt;<i>BIN</i>&gt;';
					console.log("Bin Updated Value at asset_read:", data.BIN)
				} */

				//if(data.BIN.toLowerCase() == 'undefined' || data.BIN.trim() == '') data.BIN = '&lt;<i>BIN</i>&gt;';	
				//data.BIN = '&lt;<i>BIN</i>&gt;';
				if(data.type.toLowerCase() == 'undefined' || data.type.trim() == '') data.type = '&lt;<i>type</i>&gt;';
				if(data.HIV.toLowerCase() == 'undefined' || data.HIV.trim() == '') data.HIV = '&lt;<i>HIV</i>&gt;';
				if(data.date.toLowerCase() == 'undefined' || data.date.trim() == '') data.date = '&lt;<i>date</i>&gt;';
				if(data.name.toLowerCase() == 'undefined' || data.name.trim() == '') data.name = '&lt;<i>name</i>&gt;';
				$('<tr class="foundCars" ><td class="smlBrk"></td><td class="editRw" ><span class="carID">'+data.bloodID+'</span></td><td class="editRw" colspan="2" >[<span class="carVin">'+data.BIN+'</span>] <span class="carMake">'+data.type+'</span> <span class="carModel">'+data.HIV+'</span>, <span class="carColour">'+data.name+'</span>, <span class="carReg">'+data.date+'</span><img src="Icons/Camp/edit.svg" onclick="showEditTbl(this)" class="rtBtn" width="20" height="20" /></td><td class="smlBrk" ></td></tr>').insertAfter('#insAft');
			}
		}
	}
	xhr.send()
}
