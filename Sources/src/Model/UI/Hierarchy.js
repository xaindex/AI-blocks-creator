import React from 'react';
import ReactDOM from 'react-dom';
import TreeView from 'react-treeview';
import SceneObject from '../Objects/SceneObject';
import Script from '../Objects/Script';
import Popup from './Popup';

export default class Hierarchy extends React.Component {
	constructor(props) {
	    super(props);
	    
	    this.state = {selectedObject:null};
	    window.service.hierarchyUI = this;
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
		// You can also log the error to an error reporting service
		window.service.log(error, info, 2);
	}

	renderInsertNewObjectButton()
	{
		return (<button style={{padding:"0px 2px"}} className="btn btn-light" data-toggle="modal" data-target="#insert-object-popup">
					Insert <span className="glyphicon glyphicon-plus"/>
				</button>);
	}

  	renderRecursive(objects, isRoot) 
  	{
    	if(objects!=null)
  		{
			let elems = [];

			for (let file in objects)
			{
				if(window.service.currentScene==objects[file].scene)
				{
					let selected = "";
					if(window.service.selectedObject!=null && objects[file].id===window.service.selectedObject.id)
					{
						selected = " selected";
					}

					if(window.service.selectedObjects[objects[file].id] && window.service.selectedObjects[objects[file].id]!=undefined)
						selected = " selected";

					//elems.push(<div id={"hierarchy_anchor_"+objects[file].id} className="hierarchy_anchor" onMouseLeave={this.onMouseLeaveHandlerSep.bind(this)} onMouseEnter={this.onMouseEnterHandlerSep.bind(this, objects[file])}></div>)
					
					if(objects[file].children.length>0)
					{
						let children = this.renderRecursive(objects[file].children, false)

						let label = <span id={"hierarchy_obj_"+objects[file].id} onMouseDown={this.start_drag.bind(this, objects[file])} onMouseLeave={this.onMouseLeaveHandler.bind(this)} onMouseEnter={this.onMouseEnterHandler.bind(this, objects[file])} onClick={this.selectObject.bind(this, objects[file], false)} className={"node"+selected}><span className={objects[file].getObjectIcon()}/> 
							{objects[file].name}
						</span>;
						elems.push(<TreeView className="node object" defaultCollapsed={true} nodeLabel={label}><div className="info">{children}</div></TreeView>);
					}
					else
					{
						elems.push(<div id={"hierarchy_obj_"+objects[file].id} onMouseDown={this.start_drag.bind(this, objects[file])} onMouseLeave={this.onMouseLeaveHandler.bind(this, objects[file])} onMouseEnter={this.onMouseEnterHandler.bind(this, objects[file])} onClick={this.selectObject.bind(this, objects[file], false)} className={"info"+selected}><span className={objects[file].getObjectIcon()}/> {objects[file].name}</div>);
					}
				}
			}

			if(isRoot){
				let insertobjUI = this.renderInsertNewObjectButton();
	    		let label2 = <span className="node"><span className="fa fa-object-group"/> Scene {insertobjUI}</span>;
				return <TreeView className="node object" defaultCollapsed={false} nodeLabel={label2}>{elems}</TreeView>;
			}else{
				return elems;
			}
  		}
  		else
  		{
  			return <label></label>;
  		}
	}

	onMouseEnterHandler(object) {
        window.service.hoveredObject = object;
    }

    onMouseLeaveHandler(object) {
    	if(window.service.hoveredObject==object)
        	window.service.hoveredObject = null;
    }

    onMouseEnterHandlerSep(object) {
        window.service.hoveredSeparatorObject = object;
    }

    onMouseLeaveHandlerSep() {
        window.service.hoveredSeparatorObject = null;
    }

	selectObject(object, add)
	{
		window.service.actionsManager.insertSelectObjectAction(object, add);


		let clearSelection = false;
		if(object!=null)
		{
			if(window.service.keysPressed["Control"] || add)
			{
				if(window.service.selectedObjects[object.id])
				{
					//window.service.log("removing selection: "+object.id, "", 0)
					clearSelection = true;

					delete window.service.selectedObjects[object.id];
				}
				else
				{
					//window.service.log("adding selection: "+object.id, "", 0)
					window.service.selectedObjects[object.id] = object;

					window.service.selectedObject = object;
					window.service.propertiesUI.setTarget();
					window.service.sceneUI.update();
					this.setState({selectedObject:object});
				}
			}
			else
			{
				//window.service.log("single select: "+object.id, "", 0)
				window.service.selectedObjects = {};
				window.service.selectedObjects[object.id] = object;
			}
		}
		
		if(clearSelection)
		{
			if(Object.keys(window.service.selectedObjects).length==0)
			{
				//window.service.log("single clear: "+object.id, "", 0)
				window.service.selectedObject = null;
				window.service.propertiesUI.setTarget();
				this.setState({selectedObject:null});
			}
			else
			{
				for(let i in window.service.selectedObjects)
				{
					//window.service.log("shifting selection: "+object.id, "", 0)
					window.service.selectedObject = window.service.selectedObjects[i];
					window.service.propertiesUI.setTarget();
					this.setState({selectedObject:window.service.selectedObjects[i]});
					break;
				}
			}	
		}

		if(!window.service.keysPressed["Shift"] || add)
		{
			window.service.selectedObject = object;
			window.service.propertiesUI.setTarget();
			window.service.sceneUI.update();
			this.setState({selectedObject:object});
		}
		else
		{
			window.service.propertiesUI.setTarget();
			window.service.sceneUI.update();
			this.forceUpdate();
		}
	}

	unselectObject(object)
	{
		window.service.actionsManager.insertUnselectObjectAction(object.id);

		if(window.service.selectedObjects[object.id])
		{
			//window.service.log("removing selection: "+object.id, "", 0)
			delete window.service.selectedObjects[object.id];

			if(Object.keys(window.service.selectedObjects).length==0)
			{
				//window.service.log("single clear: "+object.id, "", 0)
				window.service.selectedObject = null;
				window.service.propertiesUI.setTarget();
				this.setState({selectedObject:null});
			}
			else
			{
				for(let i in window.service.selectedObjects)
				{
					//window.service.log("shifting selection: "+object.id, "", 0)
					window.service.selectedObject = window.service.selectedObjects[i];
					window.service.propertiesUI.setTarget();
					this.setState({selectedObject:window.service.selectedObjects[i]});
					break;
				}
			}

			window.service.selectedObject = object;
			window.service.propertiesUI.setTarget();
			window.service.sceneUI.update();
			this.setState({selectedObject:object});
		}
	}

	start_drag(object)
	{
		window.service.draggedHierarchyObj = object

    	document.getElementById("dragObj").class = window.service.draggedHierarchyObj.getObjectIcon();
		window.service.draggingHierarchy = true;
	}
	
	clearSelection()
	{
		window.service.sceneUI.clearSelection();
	}

	render() {
		let ret = (
		  	<div className="scrollable_container">
		  		{this.renderRecursive(window.service.scene, true)}
		  		<div className="bg-click" onClick={this.clearSelection.bind(this)}/>
		  		<span className="fa fa-cube" id="dragObj" style={{position:"absolute"}}/>
		  		<span className="setParent" id="setParent" style={{position:"absolute"}}/>
	  		</div>
		);
  		
  		window.service.hierarchyReady = true;

		return ret;
	}
}
