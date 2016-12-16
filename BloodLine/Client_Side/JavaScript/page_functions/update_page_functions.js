var selRw;
$(document).ready(function(){
	loadLogo(pgNm);

	$("#cclPg").click(function(){
		window.location.href = "index.html";
	})

	$(document).on('click', '.userHldr', function(){
		$('.foundCars').remove();
		$('#loaderMessages').html('0 assets')
		$('#loader').show();
		$('#fade').show();
		loadUpdateAssets()
	});

})

function showEditTbl(el)
{
	$('#chooseOptTbl').fadeIn(1000);
	$('#fade').fadeIn(1000);
	$('#bloodID').val($(el).parent().parent().find('.carID').html());
	console.log("BIN updated value" ,$(el).siblings('.carVin').html());
	if($(el).siblings('.carVin').html() != '&lt;<i>BIN</i>&gt;')
	{
		$('#bin').prop('readonly', true);
		$('#bin').css('cursor', 'not-allowed');
	}
	else
	{
		$('#bin').prop('readonly', false);
		$('#bin').css('cursor', 'text');
	}
	var bin = $(el).siblings('.carVin').html()
	if(bin == '&lt;<i>BIN</i>&gt;')
	{
		bin = 0;
	}
	var type = $(el).siblings('.carMake').html()
	if(type == '&lt;<i>type</i>&gt;')
	{
		type = 'undefined'
	}
	var HIV = $(el).siblings('.carModel').html()
	if(HIV == '&lt;<i>HIV</i>&gt;')
	{
		HIV = 'undefined'
	}
	var name = $(el).siblings('.carColour').html()
	if(name == '&lt;<i>name</i>&gt;')
	{
		name = 'undefined'
	}
	var date = $(el).siblings('.carReg').html()
	if(date == '&lt;<i>date</i>&gt;')
	{
		date = 'undefined'
	}
	$('#bin').val(bin);
	$('#type').val(type);
	$('#hiv').val(HIV);
	$('#name').val(name);
	$('#date').val(date);

	$('#hidBin').val(bin);
	$('#hidType').val(type);
	$('#hidHiv').val(HIV);
	$('#hidName').val(name);
	$('#hidDate').val(date);
}

function closeEditTbl()
{
	$('#chooseOptTbl').hide();
	$('#errorRw').hide();
	$('#fade').hide();
}

function validate(el)
{

	/*
	Validation on if details have been filled in for updating a car. This is not validation on what the person is allowed to update,
	that is done within the contract on the blockchain.
	*/

	$('#errorRw').html('<ul></ul>');
	var failed = false;
	if(isNaN(parseInt($('#bin').val().trim())))
	{
		$('#errorRw').find('ul').append('<li>BIN must be a number</li>')
		failed = true;
	}
	if($('#bin').val().trim().length != 15 && $('#bin').val().trim() != 0)
	{

		$('#errorRw').find('ul').append('<li>BIN must be 15 characters (Currently ' + $('#bin').val().trim().length + ' characters)</li>')
		failed = true;
	}
	if($('#bin').val().trim() == 0 && $('#hidBin').val().trim() != 0)
	{
		$('#errorRw').find('ul').append('<li>BIN cannot be reset to 0</li>')
		failed = true;
	}
	if($('#type').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Type cannot be blank</li>')
		failed = true;
	}
	if($('#type').val().trim().toLowerCase() == 'undefined' && $('#hidType').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>Type cannot be reset to undefined</li>')
		failed = true;
	}
	if($('#hiv').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>HIV cannot be blank</li>')
		failed = true;
	}
	if($('#hiv').val().trim().toLowerCase() == 'undefined' && $('#hidHiv').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>HIV cannot be reset to undefined</li>')
		failed = true;
	}
	if($('#name').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Name cannot be blank</li>')
		failed = true;
	}
	if($('#name').val().trim().toLowerCase() == 'undefined' && $('#hidName').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>Name cannot be reset to undefined</li>')
		failed = true;
	}
	if($('#date').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Date cannot be blank</li>')
		failed = true;
	}
	if($('#date').val().trim().toLowerCase() == 'undefined' && $('#hidDate').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>Date cannot be reset to undefined</li>')
		failed = true;
	}
	if(!failed)
	{
		$('#errorRw').hide();
		updateAsset($('#bin').val().trim(), $('#type').val().trim(), $('#hiv').val().trim(), $('#name').val().trim(), $('#date').val().trim().toUpperCase(), $('#bloodID').val(), el)
	}
	else
	{
		$('#errorRw').show();
	}
}
