window.onload = function () {
	let _quantity, _price, orderitem_num, delta_quantity, orderitem_quantity, delta_cost;
	let quantity_arr = [];
	let price_arr = [];

	let TOTAL_FORMS = parseInt($('input[name="orderitems-TOTAL_FORMS"]').val());

	let order_total_quantity = parseInt($('.order_total_quantity').text()) || 0;
	let order_total_cost = parseFloat($('.order_total_cost').text().replace(',', '.')) || 0;

	for (let i=0; i < TOTAL_FORMS; i++) {
	   _quantity = parseInt($('input[name="orderitems-' + i + '-quantity"]').val());
	   _price = parseFloat($('.orderitems-' + i + '-price').text().replace(',', '.'));

	   quantity_arr[i] = _quantity;
	   if (_price) {
		   price_arr[i] = _price;
	   } else {
		   price_arr[i] = 0;
	   }
	}

	if (!order_total_quantity) {
	   for (let i=0; i < TOTAL_FORMS; i++) {
		   order_total_quantity += quantity_arr[i];
		   order_total_cost += quantity_arr[i] * price_arr[i];
	   }
	   $('.order_total_quantity').html(order_total_quantity.toString());
	   $('.order_total_cost').html(Number(order_total_cost.toFixed(2)).toString());
	}


	$('.order_form').on('click', 'input[type="number"]', function () {
	   let target = event.target;
	   orderitem_num = parseInt(target.name.replace('orderitems-', '').replace('-quantity', ''));

	   if (price_arr[orderitem_num]) {
		   orderitem_quantity = parseInt(target.value);
		   delta_quantity = orderitem_quantity - quantity_arr[orderitem_num];
		   quantity_arr[orderitem_num] = orderitem_quantity;
		   orderSummaryUpdate(price_arr[orderitem_num], delta_quantity);
	   }
	});

	$('.order_form').on('click', 'input[type="checkbox"]', function () {
	   let target = event.target;
	   orderitem_num = parseInt(target.name.replace('orderitems-', '').replace('-DELETE', ''));

	   if (target.checked) {
		   delta_quantity = -quantity_arr[orderitem_num];
	   } else {
		   delta_quantity = quantity_arr[orderitem_num];
	   }
	   orderSummaryUpdate(price_arr[orderitem_num], delta_quantity);
	});


	$('.order_form select').change(function (event) {
        let target = event.target;
        let row = target.parentNode.parentNode;
        let price_row = row.querySelector('.td3');
        let number_row = row.querySelector('input[type="number"]');
        orderitem_num = parseInt(number_row.name.replace('orderitems-', '').replace('-quantity', ''));

        $.ajax({
            url: "/order/get/price/" + target.value + "/",

            success: function (data) {
                let price_product = data.result.toString().replace('.', ',');
                $(price_row).html('<span class="orderitems-' + orderitem_num + '-price">' + price_product +'</span><i class="fas fa-ruble-sign"></i>');

                quantity_arr[orderitem_num] = 0;
                price_arr[orderitem_num] = parseFloat(data.result);
            },
        });

        event.preventDefault();

    });


	function orderSummaryUpdate(orderitem_price, delta_quantity) {
	   delta_cost = orderitem_price * delta_quantity;

	   order_total_cost = Number((order_total_cost + delta_cost).toFixed(2));
	   order_total_quantity = order_total_quantity + delta_quantity;

	   $('.order_total_cost').html(order_total_cost.toString());
	   $('.order_total_quantity').html(order_total_quantity.toString());
	}



	function deleteOrderItem(row) {
	   let target_name= row[0].querySelector('input[type="number"]').name;
	   orderitem_num = parseInt(target_name.replace('orderitems-', '').replace('-quantity', ''));
	   delta_quantity = -quantity_arr[orderitem_num];
	   orderSummaryUpdate(price_arr[orderitem_num], delta_quantity);
	   delta_quantity = -quantity_arr[orderitem_num];
		quantity_arr[orderitem_num] = 0;
	   if (!isNaN(price_arr[orderitem_num]) && !isNaN(delta_quantity)) {
		   orderSummaryUpdate(price_arr[orderitem_num], delta_quantity);
	   }

	}

	$('.formset_row').formset({
	   addText: 'добавить продукт',
	   deleteText: 'удалить',
	   prefix: 'orderitems',
	   removed: deleteOrderItem
	});


	$('.order_form select').change(function () {
	   let target = event.target;
	   console.log(target);
	});

	$('.order_form select').change(function () {
	   let target = event.target;
	   orderitem_num = parseInt(target.name.replace('orderitems-', '').replace('-product', ''));
	   let orderitem_product_pk = target.options[target.selectedIndex].value;

	   if (orderitem_product_pk) {
		   $.ajax({
			   url: "/order/product/" + orderitem_product_pk + "/price/",
			   success: function (data) {
				   if (data.price) {
					   price_arr[orderitem_num] = parseFloat(data.price);
					   if (isNaN(quantity_arr[orderitem_num])) {
						   quantity_arr[orderitem_num] = 0;
					   }
					   let price_html = '<span>' + data.price.toString().replace('.', ',') + '</span> руб';
					   let current_tr = $('.order_form table').find('tr:eq(' + (orderitem_num + 1) + ')');


					   current_tr.find('td:eq(2)').html(price_html);

					   if (isNaN(current_tr.find('input[type="number"]').val())) {
						   current_tr.find('input[type="number"]').val(0);
					   }
					   orderSummaryRecalc();
				   }
			   },
		   });
	   }
	});

	if (!order_total_quantity) {
	   orderSummaryRecalc();
	}

	function orderSummaryRecalc() {
	   order_total_quantity = 0;
	   order_total_cost = 0;

	   for (let i=0; i < TOTAL_FORMS; i++) {
		   order_total_quantity += quantity_arr[i];
		   order_total_cost += quantity_arr[i] * price_arr[i];
	   }
	   $('.order_total_quantity').html(order_total_quantity.toString());
	   $('.order_total_cost').html(Number(order_total_cost.toFixed(2)).toString());
	}


}