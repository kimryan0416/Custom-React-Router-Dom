import React, { Component } from 'react';

export default class REACT_DOM_ROUTER {
	static myInstance = null;
	_BROWSERROUTER = null;
	_UPDATEPAGES = [];
	_CURRENT_PAGE = null;

	static getInstance() {
		if (REACT_DOM_ROUTER.myInstance == null) {
			REACT_DOM_ROUTER.myInstance = new REACT_DOM_ROUTER();
		}
		return this.myInstance;
	}

	_initialize = (browserRouterComponent, startPage = '/') => {
	  if (browserRouterComponent != null) 
		this._BROWSERROUTER = browserRouterComponent;
		this._CURRENT_PAGE = startPage;
	}

	_getPage = () => {
		return this._CURRENT_PAGE;
	}

	_setPage = (newPage = '/') => {
		this._CURRENT_PAGE = newPage;
		if (this._BROWSERROUTER) {
			this._BROWSERROUTER.updatePage(newPage);
		}
		if (this._UPDATEPAGES.length > 0) {
			this._UPDATEPAGES.forEach(comp=>{
				comp.updatePage(newPage);
			});
		}
	}

	_addUpdatePage = (component) => {
		this._UPDATEPAGES.push(component);
	}
}

export class BrowserRouter extends Component {
  constructor() {
	  super();
	  this.state = {
		  _CURRENT_PAGE: '/'
	  }
	  this.router = REACT_DOM_ROUTER.getInstance();
	  this.router._initialize(this, this.state._CURRENT_PAGE);
  }
  updatePage = (newPage = '/') => {
		this.setState({
		  _CURRENT_PAGE: newPage
		});
  }
  render() {
		return this.props.children;
  }
}

export class Switch extends Component {
  constructor(props) {
	super(props);
	this.router = REACT_DOM_ROUTER.getInstance();
	this.state = {
	  _CURRENT_PAGE: this.router._getPage()
	}
	this.router._addUpdatePage(this);
  }
  updatePage = (newPage = '/') => {
	this.setState({
	  _CURRENT_PAGE: newPage
	});
  }
  render() {
    var pathname = this.router._getPage();
    var element, match; 
    React.Children.forEach(this.props.children, child => {
      if (match == null && React.isValidElement(child)) {
        element = child;
        var path = child.props.path;
        match = matchPath(
					pathname, 
					{...child.props, path: path}
				);
			}
    });
    return match ? React.cloneElement(element) : null;
  }
}

export class Route extends Component {
  constructor(props) {
		super(props);
		this.router = REACT_DOM_ROUTER.getInstance();
		this.state = {
		  _CURRENT_PAGE: this.router._getPage()
		}
		this.router._addUpdatePage(this);
  }
  updatePage = (newPage = '/') => {
		this.setState({
		  _CURRENT_PAGE: newPage
		});
  }
  render() {
		const { path, component, children } = this.props;
		const exact = (typeof this.props.exact === 'boolean') 
			? this.props.exact 
			: false;
		const match = matchPath(
			this.router._getPage(),
			{ path, exact }
		);
		if (!match) return null;
		if (component) return component;
		if (children) return children;
		return null;
  }
}

export function Link(props) {
  const router = REACT_DOM_ROUTER.getInstance();
  const { to, children } = props; 
  return (
    <a onClick={()=>{router._setPage(to)}}>
	  	{children}
    </a>
  );
}

const matchPath = (pathname, options) => {
  const { exact = false, path } = options
  if (!path) {
    return {
      path: null,
      url: pathname,
      isExact: true,
    }
  }
  const match = new RegExp(path).exec(pathname)
  if (!match) return null
  const url = match[0]
  const isExact = pathname === url
  if (exact && !isExact) return null
  return {
    path,
    url,
    isExact,
  }
}