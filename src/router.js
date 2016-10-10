import Router from 'regular-router';

export default class RouterManager {
	constructor( app ) {
		this._app = app;

		const Base = app._Base;
		Base.use( Router );
		app.once( 'before-start', () => {
			const getters = app._getters;
			const options = this._options || {};
			const { routes } = options;
			walkRoutes( routes, route => {
				const components = route.components || {};
				if ( route.component ) {
					components[ 'default' ] = route.component;
				}
				for ( let i in components ) {
					const Component = components[ i ];
					const computed = Component.computed;
					const cps = Component.components;
					for ( let j in computed ) {
						const c = computed[ j ];
						if ( typeof c === 'string' ) {
							if ( getters[ c ] ) {
								computed[ j ] = () => {
									// replaceState will replace state reference
									// so get state in realtime when computes
									const state = app._store.getState();
									return getters[ c ]( state )
								};
							} else {
								delete computed[ j ];
							}
						}
					}
				}
			} );
		} );
	}
	set( options ) {
		this._options = options;
	}
	start() {
		const router = new Router( this._options );
		this._app.$router = router;
		router.start();
	}
}

function walkRoutes( routes, fn ) {
	for ( let i = 0, len = routes.length; i < len; i++ ) {
		const route = routes[ i ];
		fn( route );
		if ( route.children ) {
			walkRoutes( route.children, fn );
		}
	}
}