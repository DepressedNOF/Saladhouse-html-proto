			/* https://www.youtube.com/watch?v=SETnK2ny1R0 */
			class roomplan{
				constructor(canvas, roomdata, interactive=false){
					
					this.canvas = canvas;
					this.roomdata = roomdata;
					this.interactive = interactive;
					
					this.fontFamily = 'Verdana, sans-serif';
					
					this.outlineWidth = 2;
					this.tableBasis = 30;
					this.fontSize = 16;
					
					this.outlineColor = '#fff';
					this.doorColor = '#ff0';
					this.windowColor = '#03f';
					this.tableColor = '#422';
					this.tableColorHover = '#746';
					this.seatColor = '#633';
					this.seatColorHover = '#959';
					
					this.clickCallback = undefined;
					
					canvas.attr(
						"width", roomdata.areawidth
					).attr(
						"height", roomdata.areaheight
					);
					
					roomdata.sections.forEach(function(val, si, sa){
						if(val.outline.x2){
							//only if there are atleast two points for the outline
							this.canvas.drawLine({
								layer: true,
								name: 'o'+si,
								groups: ['o', 's'+si],
								strokeStyle: this.outlineColor,
								strokeWidth: this.outlineWidth,
								...val.outline,
								closed: true
							});
						}
						this.canvas.drawText({
							layer: true,
							name: 'sn'+si,
							groups: ['t', 's'+si],
							fillStyle: this.outlineColor,
							x: val.outline.x1 + 20, y: val.outline.y1 -20,
							fontSize: this.fontSize,
							fontFamily: this.fontFamily,
							text: val.name,
							fromCenter: false
						});
						
						val.features.forEach(function(val, fi, fa){
							switch(val.type){
								case "door": 
									this.canvas.drawLine({
										layer: true,
										name: 'd'+si+'.'+fi,
										groups: ['f','d', 's'+si],
										strokeStyle: this.doorColor,
										strokeWidth: this.outlineWidth+2,
										x1: val.x1,
										y1: val.y1,
										x2: val.x2,
										y2: val.y2,
									});
									if(val.isWC){
										this.canvas.drawText({
											layer: true,
											name: 'dw'+fi,
											groups: ['d', 's'+si],
											fillStyle: this.outlineColor,
											x: val.x1 + 20, y: val.y1 -20,
											fontSize: this.fontSize,
											fontFamily: this.fontFamily,
											text: "WC",
											fromCenter: false
										});
									}
									break;
								case "window":
									this.canvas.drawLine({
										layer: true,
										name: 'w'+si+'.'+fi,
										groups: ['f','w', 's'+si],
										strokeStyle: this.windowColor,
										strokeWidth: this.outlineWidth+2,
										x1: val.x1,
										y1: val.y1,
										x2: val.x2,
										y2: val.y2,
									});
									break;
							}
						}, this);
						
						val.tables.forEach(function(val, ti, ta){
							let tableWidth = (val.seatsX>0) ? this.tableBasis * val.seatsX : this.tableBasis;
							let tableHeight = (val.seatsY>0) ? this.tableBasis * val.seatsY : this.tableBasis;
							//table base
							this.canvas.drawRect({
								layer: true,
								name: 't'+si+'.'+ti,
								groups: ['t', 't'+si+'.'+ti, 's'+si],
								fillStyle: this.tableColor,
								x: val.x,
								y: val.y,
								width: tableWidth,
								height: tableHeight,
								fromCenter: false,
								data: {si: si, ti: ti}
							});
							//accessibility icon
							if(val.isAccessible){
								this.canvas.drawImage({
									layer: true,
									name: 'i'+si+'.'+ti,
									groups: ['i', 't'+si+'.'+ti, 's'+si],
									source: 'img/style/common/wheelchair_accessible_icon_wob.svg',
									x: val.x + 0.5*tableWidth,
									y: val.y + 0.5*tableHeight,
									width: this.tableBasis-2,
									height: this.tableBasis-2
								});
							}
							//seats
							if(val.seatsX){
								for(var i=0; i<val.seatsX; i++){
									//top
									this.canvas.drawRect({
										layer: true,
										name: 'c'+si+'.'+ti+'.t'+i,
										groups: ['c', 't'+si+'.'+ti, 's'+si],
										fillStyle: this.seatColor,
										x: val.x + i*this.tableBasis + 0.15*this.tableBasis,
										y: val.y - 0.25*this.tableBasis,
										width: this.tableBasis - 0.3*this.tableBasis,
										height: 0.25*this.tableBasis,
										fromCenter: false
									});
									//bottom
									this.canvas.drawRect({
										layer: true,
										name: 'c'+si+'.'+ti+'.b'+i,
										groups: ['c', 't'+si+'.'+ti, 's'+si],
										fillStyle: this.seatColor,
										x: val.x + i*this.tableBasis + 0.15*this.tableBasis,
										y: val.y + tableHeight,
										width: this.tableBasis - 0.3*this.tableBasis,
										height: 0.25*this.tableBasis,
										fromCenter: false
									});
								}
							}
							
							if(val.seatsY){
								for(var i=0; i<val.seatsY; i++){
									//left
									this.canvas.drawRect({
										layer: true,
										name: 'c'+si+'.'+ti+'.l'+i,
										groups: ['c', 't'+si+'.'+ti, 's'+si],
										fillStyle: this.seatColor,
										x: val.x - 0.25*this.tableBasis,
										y: val.y + i*this.tableBasis + 0.15*this.tableBasis,
										width: 0.25*this.tableBasis,
										height: this.tableBasis - 0.3*this.tableBasis,
										fromCenter: false,
										data: {si: si, ti: ti},
										mouseover: this.tableMouseover.bind(this),
										mouseout: this.tableMouseout.bind(this)
									});
									//right
									this.canvas.drawRect({
										layer: true,
										name: 'c'+si+'.'+ti+'.r'+i,
										groups: ['c', 't'+si+'.'+ti, 's'+si],
										fillStyle: this.seatColor,
										x: val.x + tableWidth,
										y: val.y + i*this.tableBasis + 0.15*this.tableBasis,
										width: 0.25*this.tableBasis,
										height: this.tableBasis - 0.3*this.tableBasis,
										fromCenter: false,
										data: {si: si, ti: ti},
										mouseover: this.tableMouseover.bind(this),
										mouseout: this.tableMouseout.bind(this)
									});
								}
							}
							//drawMouseTarget
							this.canvas.drawRect({
								layer: true,
								name: 'm'+si+'.'+ti,
								groups: ['m', 't'+si+'.'+ti, 's'+si],
								fillStyle: 'rgba(0,0,0,0)',
								x: (val.seatsY>0)?val.x - 0.25*this.tableBasis:val.x,
								y: (val.seatsX>0)?val.y - 0.25*this.tableBasis:val.y,
								width: (val.seatsY>0)?tableWidth + 0.5*this.tableBasis:tableWidth,
								height: (val.seatsX>0)?tableHeight + 0.5*this.tableBasis:tableHeight,
								fromCenter: false,
								data: {si: si, ti: ti},
								mouseover: this.tableMouseover.bind(this),
								mouseout: this.tableMouseout.bind(this),
								click: this.tableClick.bind(this)
							});
						}, this);
					}, this);
					
				}
				
				tableMouseover(layer){
					if(this.interactive){
						let layers = this.canvas.getLayerGroup('t'+layer.data.si+'.'+layer.data.ti);
						let base = layers.filter(function(val, i, a){return val.name[0] === 't'});
						let chairs = layers.filter(function(val, i, a){return val.name[0] === 'c'});
						
						this.canvas.animateLayer(base[0], {fillStyle: this.tableColorHover}, 250);
						chairs.forEach(function(val, i, a){this.canvas.animateLayer(val, {fillStyle: this.seatColorHover},250)}, this);
						this.canvas.css("cursor", "pointer");
					}
				}
				
				tableMouseout(layer){
					if(this.interactive){
						let layers = this.canvas.getLayerGroup('t'+layer.data.si+'.'+layer.data.ti);
						let base = layers.filter(function(val, i, a){return val.name[0] === 't'});
						let chairs = layers.filter(function(val, i, a){return val.name[0] === 'c'});
						
						this.canvas.animateLayer(base[0], {fillStyle: this.tableColor}, 250);
						chairs.forEach(function(val, i, a){this.canvas.animateLayer(val, {fillStyle: this.seatColor},250)}, this);
						this.canvas.css("cursor", "initial");
					}
				}
				
				tableClick(layer){
					if(this.interactive){
						if(this.clickCallback){
							this.clickCallback(layer.data.si, layer.data.ti);
						}
					}
				}
				
				setClickCallback(f){
					this.clickCallback = f;
				}
				
				
			};