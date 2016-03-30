/*Usage:

var board = new BigBoard({
	id:"",       // Div id to be transform to a bigBoard
});

*/

function BigBoard(param){

	function Coordinate(x, y) {
        this.x = x;
        this.y = y;
    };


	function Context(position, width, height){
		this.position = position;
		this.width = width;
		this.height = height;
	};


	function DataItem(id, position, content, status){
		this.id = id;
		this.position = position;
		this.content = content;
		this.status = status;

		this.toHTMLElement = function(context){

			var item = document.createElement("div");
			$(item).attr("id", id);
			$(item).addClass("item");
			$(item).attr("draggable","true");
			$(item).css({cursor:"move"});

			var itemContent = document.createElement("div");
			$(itemContent).addClass("itemContent");
			$(itemContent).attr("contenteditable","false");
			itemContent.innerHTML = content;

			item.appendChild(itemContent);
			item.style.top = (position.y-context.position.y)+"px";
			item.style.left = (position.x-context.position.x)+"px";
			//$(item).css({top:(position.y-context.position.y)+"px",left:(position.x-context.position.x)+"px"});
			
			//console.log($(item).html());
			return item;
		}
	};

	function CoreData(context){
		
		_context = context;
		_dataItems = new Array();
		loaded = false;


		var load = function(){
			//_dataItems = new Array();
			//ajax call to load
			$.getJSON("http://localhost:3000/data",function(result){
				$.each(result, function(i, dataItem){
					_dataItems.push(new DataItem(dataItem.id,dataItem.position,dataItem.content,dataItem.status));
					//console.log(dataItem);
				});
				loaded = true;
			});

			// if(typeof(Storage)!=="undefined") { // localStorage and sessionStorage support!
  			
  	// 			//_dataItems = localStorage.bigBoardData;

  	// 		} else {
  	// 			console.log("No localStorage support.");
  	// 		}	
		};

		load();

		this.getItem = function(id){
			for (var i =0; i < _dataItems.length; i ++){
				if (_dataItems[i].id == id){
					return i;
				}
			}
			return -1;
		};


		this.createItem = function(position, content){
			var newItem = new DataItem();
			newItem.id = new Date().getTime();
			newItem.position = position;
			newItem.content = content;
			newItem.status = "NEW";
			_dataItems.push(newItem); 
			//console.log(newItem);
			return newItem;

		};

		this.deleteItem = function(id){
			var index = this.getItem(id);
			if (index >= 0){
				_dataItems[index].status = "DELETED";
				//_dataItems.splice(index, 1);
			}
			return index;
		};

		this.updateItem = function(id, content){
			console.log("update id is:"+id);
			console.log("update content is:"+content);
			var index = this.getItem(id);
			if (index >= 0){
				_dataItems[index].content = content;
				_dataItems[index].status = "UPDATED";
			}
			//console.log(_dataItems);
			return index;
		};

		this.moveItem = function(id, offset){
			var index = this.getItem(id);
			if (index >= 0){
				_dataItems[index].position.x += offset.x;
				_dataItems[index].position.y += offset.y;
				_dataItems[index].status = "MOVED";
			}
			//console.log(_dataItems);
			return index;
		};

		this.appendAllTo = function(element){
			var html = "";
			//console.log("dataItems length:"+_dataItems.length);
			for (var i = 0; i < _dataItems.length; i++) {
				console.log(_dataItems[i].toHTMLElement(_context));
				element.appendChild(_dataItems[i].toHTMLElement(_context));
			}	
		};

		this.moveBoard = function(offset){
			_context.position.x += offset.x;
			_context.position.y += offset.y;
		};

		this.getBoardPosition = function(){
			console.log(_context);
			return _context.position;
		};
		
		
	};


	var createDelegate = function(object, method) {
		//console.log("createDelegate(object:"+object+",method:"+method);
		var delegate = function(e) {
			var args = [];
			args.push(e);
			method.apply(object,args);
		}
		return delegate;
	};


	/**
     * Name:        AddListener()
     * Description: Adds an event listener to the specified element.
     * Parameters:  element - The element for which the listener is being added
     *              event - The event for which the listener is being added
     *              f - The function being called each time that the event occurs
     */
    var AddListener = function(element, event, f) {
        if(element.attachEvent) {
            element["e" + event + f] = f;
            element[event + f] = function () {
                element["e" + event + f](window.event)
            };
            element.attachEvent("on" + event, element[event + f])
        } else element.addEventListener(event, f, false)
    }


	var t = this;
	//console.log("id is " + param.id);
	t.board = document.getElementById(param.id);


	// load board
	if(typeof(Storage)!=="undefined") { // localStorage and sessionStorage support!
  		
  		var context = new Context({width:t.board.offsetWidth,height:t.board.offsetHeight});
  		context.position = typeof localStorage.bigBoardPosition == "undefined" ? new Coordinate(0,0) : localStorage.bigBoardPosition;
  		console.log(context.position);
  		//board.innerHTML = typeof localStorage.bigBoardData == "undefined" ? "": localStorage.bigBoardData;
  		t.coreData = new CoreData(context);
  		t.coreData.appendAllTo(t.board);

  	} else {
  		console.log("No localStorage support.");
  		t.board.innerHTML = "No connection to storage";
  	}

	t.mousePosition = new Coordinate;
	t.lastMouseDownPosition = new Coordinate;



	//// ================  Big Board Item Event Hander ======================

	$(document).on('dblclick','.item',function(e){
		//todo add edit function
		
		$(this).attr('draggable','false');
		$(this).children(":first").attr("contenteditable","true");
		$(this).css({cursor:"auto"});
		$(this).children(":first").focus();

		e.stopPropagation();
		return false;

	});


	$(document).on('focus','.itemContent', function(){
		//console.log("focused");
	});

	$(document).on('blur','.itemContent', function(){
		//console.log("blurred");
		$(this).attr("contenteditable","false");
		$(this).parent().attr("draggable","true");
		$(this).parent().css({cursor:"move"});
		var args = [];
		args.push($(this).parent().attr("id"));
		args.push($(this).html());
		t.coreData.updateItem.apply(t.coreData, args);
		//t.SaveBoard(t.board);
	});



	//// ==================== Big Board Move Event-Handler ==================

	


    AddListener(t.board,'dragstart',function(e){

		var realTarget = e ? e.target : window.event.srcElement;
		console.log('dragstart:'+e.clientX+','+e.clientY);

		if ($(realTarget).hasClass('item')){
			var style = window.getComputedStyle(realTarget, null);
   				e.dataTransfer.setData("text/plain",
   				(parseInt(style.getPropertyValue("left"),10) - e.clientX) + ',' + 
   				(parseInt(style.getPropertyValue("top"),10) - e.clientY) + ',' + 
   				realTarget.id + ',' +
   				e.clientX + ',' +
   				e.clientY
   			);	
		}
	});

	AddListener(t.board,'dragover',function(e){
		e.dataTransfer.dropEffect = 'move';
		e.preventDefault();
	});

	AddListener(t.board,'dragenter',function(e){
   		this.classList.add('over');
	}); 

	AddListener(t.board,'dragleave',function(e){
		this.classList.remove('over');
	});

	// AddListener(t.board,'drop',(function(t){
	// 	return function(e) { 
	// 		//console.log("drop called.");
 //   			var offset = e.dataTransfer.getData("text/plain").split(',');
 //   			var moveItem = document.getElementById(offset[2]);
   			
 //   			moveItem.style.left = (e.clientX + parseInt(offset[0],10)) + 'px';
 //   			moveItem.style.top = (e.clientY + parseInt(offset[1],10)) + 'px';
 //   			//t.SaveBoard(t.board);
 //   			var args = [];
	// 		args.push(moveItem.id);
	// 		var startX = parseInt(offset[3],10);
	// 		var startY = parseInt(offset[4],10);
	// 		args.push({x:e.clientX - startX,y:e.clientY - startY});
	// 		t.coreData.moveItem.apply(t.coreData, args);
 //   			e.preventDefault();
 //   			return false;
	// 	};
	// })(t));

	AddListener(t.board,'drop',function(e){ 
			//console.log("drop called.");
			console.log('drop:'+e.clientX+','+e.clientY);
   			var offset = e.dataTransfer.getData("text/plain").split(',');
   			var moveItem = document.getElementById(offset[2]);
   			
   			moveItem.style.left = (e.clientX + parseInt(offset[0],10)) + 'px';
   			moveItem.style.top = (e.clientY + parseInt(offset[1],10)) + 'px';
   			//t.SaveBoard(t.board);
   			var args = [];
			args.push(offset[2]);
			var startX = parseInt(offset[3],10);
			var startY = parseInt(offset[4],10);
			args.push({x:(e.clientX - startX),y:e.clientY - startY});
			t.coreData.moveItem.apply(t.coreData, args);
   			e.preventDefault();
   			return false;
		});

	AddListener(t.board,'dblclick',function(e){
		var realTarget = e ? e.target : window.event.srcElement;
		if (!$(realTarget).hasClass('board')) {
			return;
		}
		//console.log('1');
		var boardPosition = t.coreData.getBoardPosition.call(t.coreData);
		//console.log('here');
		var position = {x:e.clientX - boardPosition.x, y:e.clientY - boardPosition.y};
		var dataItem = t.coreData.createItem.call(t.coreData,position,"");
		var addItem = $('<div class="item"><div class="itemContent" contenteditable="true"></div></div>');
		addItem.css({top:e.clientY,left:e.clientX});
		addItem.attr('id', dataItem.id);
		$(this).append(addItem);
		addItem.children(":first").focus();
	});


	/**
	 *
	 */
	var MoveBoard = function(offsetX, offsetY){
		console.log("move board called");
		//move existing elements
		var children = t.board.childNodes;
		//console.log("children length:"+children.length);
		for (var i = 0; i < children.length; i++){
			if ($(children[i]).hasClass('item')){
				//console.log("item found");
				children[i].style.left = (children[i].offsetLeft + offsetX) + "px";
				children[i].style.top = (children[i].offsetTop + offsetY) + "px";
			}
		}
		

		//TBD:check for new elements to render

		//TBD:remove element invisible if nescessary
	};


	/**
     * Name:        MouseMove()
     * Description: Function called every time that the mouse moves
     */
    var MouseMove = function (b) {
    	//console.log("MouseMove called,x:"+b.clientX+" y:"+b.clientY);
        var offsetX = b.clientX - t.mousePosition.x;
        var offsetY = b.clientY - t.mousePosition.y;
        //console.log("offsetX:"+offsetX+" offsetY:"+offsetY);    
        MoveBoard(offsetX, offsetY);
        t.mousePosition.x = b.clientX;
        t.mousePosition.y = b.clientY;
    };

	/**
     * mousedown event handler
     */
    AddListener(t.board, "mousedown", function (e) {
    	

    	var realTarget = e ? e.target : window.event.srcElement;
		if (!$(realTarget).hasClass('board')) {
			return;
		}

		console.log("mousedown triggerd");

        t.board.style.cursor = "url(data:image/x-win-bitmap;base64,AAACAAEAICACAAcABQAwAQAAFgAAACgAAAAgAAAAQAAAAAEAAQAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAA/AAAAfwAAAP+AAAH/gAAB/8AAAH/AAAB/wAAA/0AAANsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////////////////////////////////////////////////////////gH///4B///8Af//+AD///AA///wAH//+AB///wAf//4AH//+AD///yT/////////////////////////////8=), default";

        // Save the current mouse position so we can later find how far the
        // mouse has moved in order to scroll that distance
        t.mousePosition.x = e.clientX;
        t.mousePosition.y = e.clientY;
        t.lastMouseDownPosition.x = e.clientX;
        t.lastMouseDownPosition.y = e.clientY;


        // Start paying attention to when the mouse moves
        AddListener(document, "mousemove", MouseMove);
        t.mouseDown = true;

        // If the map is set to continue scrolling after the mouse is released,
        // start a timer for that animation
        // if(t.scrolling) {
        //     t.timerCount = 0;

        //     if(t.timerId != 0)
        //     {
        //         clearInterval(m.timerId);
        //         t.timerId = 0;
        //     }
            
        //     t.timerId = setInterval(OnScrollTimer, 20);
        // }
        
        //e.preventDefault();
    }); 

	/**
     * mouseup event handler
     */
    AddListener(document, "mouseup", function (e) {
    	

    	var realTarget = e ? e.target : window.event.srcElement;
		if (!$(realTarget).hasClass('board')) {
			return;
		}
		console.log("mouseup triggered");

        if(t.mouseDown) {
            var handler = MouseMove;
            if(document.detachEvent) {
                document.detachEvent("onmousemove", document["mousemove" + handler]);
                document["mousemove" + handler] = null;
            } else {
                document.removeEventListener("mousemove", handler, false);
            }
            
            t.mouseDown = false;

            var offsetX = e.clientX - t.lastMouseDownPosition.x;
            var offsetY = e.clientY - t.lastMouseDownPosition.y;
            var args = [];
            args.push({x:offsetX,y:offsetY});
            t.coreData.moveBoard.apply(t.coreData,args);

            
            // if(m.mouseLocations.length > 0) {
            //     var clickCount = m.mouseLocations.length;
            //     m.velocity.x = (m.mouseLocations[clickCount - 1].x - m.mouseLocations[0].x) / clickCount;
            //     m.velocity.y = (m.mouseLocations[clickCount - 1].y - m.mouseLocations[0].y) / clickCount;
            //     m.mouseLocations.length = 0;
            // }
        }
        
        t.board.style.cursor = "auto";
    });


	

}

$(document).ready(function(){

	var board = new BigBoard({id:"id_board"});
	
});


