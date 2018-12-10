
// Import the core angular services.
import { Component } from "@angular/core";
import firebase = require( "firebase/app" );
import { Location } from "@angular/common";

// Import these libraries for their side-effects.
import "firebase/auth";

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

interface User {
	id: string;
	email: string;
}

@Component({
	selector: "my-app",
	styleUrls: [ "./app.component.less" ],
	template:
	`
		<div [ngSwitch]="view">

			<div *ngSwitchCase="( 'loading' )">

				<p>
					<em>Loading....</em>
				</p>

			</div>

			<div *ngSwitchCase="( 'login' )">

				<form (submit)="$event.preventDefault(); sendLink( emailInput.value.trim() )">
					<strong>Email:</strong>
					<input #emailInput type="text" size="35" />
					<input type="submit" value="Sign-In" />
				</form>

			</div>

			<div *ngSwitchCase="( 'authenticate' )">

				....

			</div>

			<div *ngSwitchCase="( 'home' )">

				<p>
					Welcome <strong>{{ user.email }}</strong>.
				</p>

				<p>
					<a (click)="signout()">Sign-Out</a>
				</p>

			</div>

		</div>
	`
})
export class AppComponent {

	public view: "loading" | "login" | "authenticate" | "home";
	public user: User | null;

	private location: Location;
	
	constructor( location: Location ) {

		this.location = location;

		this.view = "loading";
		this.user = null;

	}

	// ---
	// PUBLIC METHODS.
	// ---

	public ngOnInit() : void {

		firebase.initializeApp({
			apiKey: "AIzaSyBvifzQI6GNzQIVf-2IOTeDYS3oj6i5p1Y",
			authDomain: "fir-auth-demo-eb4d9.firebaseapp.com",
			databaseURL: "https://fir-auth-demo-eb4d9.firebaseio.com",
			projectId: "fir-auth-demo-eb4d9",
			storageBucket: "fir-auth-demo-eb4d9.appspot.com",
			messagingSenderId: "426562040801"
		});

		// After we initialize Firebase, we want to leave the app in a loading state
		// until we know whether the current user is logged-in our logged-out. The user
		// state is managed internally by Firebase.
		var stopListening = firebase.auth().onAuthStateChanged(
			( user: firebase.User ) => {

				// For the sake of this demo, we only care about the authentication state
				// change on the initial load. For all other actions, we will be able to
				// determine user status based on the resultant promises.
				stopListening();

				if ( user && user.uid && user.email ) {

					this.user = {
						id: user.uid,
						email: user.email
					}
					
				} else {

					this.user = null;

				}

				// Hook up the location watcher so we can render the correct view.
				this.location.subscribe(
					() => {

						this.updateView();

					}
				);

				this.updateView();

			}
		);



		/*
		// If the current request denotes an authentication URL, then that will take
		// precedence over other rendering options. 
		if ( firebase.auth().isSignInWithEmailLink( window.location.href ) ) {

			this.view = "authenticate";

		}
		*/





		

	}


	public sendLink( email: string ) : void {

		var externalAuthenticateUrl = (
			this.getAppIngress() +
			this.location.prepareExternalUrl( "/authenticate" )
		);

		firebase.auth()
			.sendSignInLinkToEmail(
				email,
				{
					url: externalAuthenticateUrl,
					handleCodeInApp: true
				}
			)
			.then(
				( response ) => {

					console.log( "SUCCESS:" );
					console.log( response );

				},
				( error: any ) => {

					console.warn( "ERROR:" );
					console.error( error );

				}
			)
		;

	}


	public signout() : void {

		firebase.auth().signOut().then(
			() => {

				this.view = "login";

			},
			( error: any ) => {

				console.warn( "Sign-out failure." );
				console.error( error );

			}
		);

	}

	// ---
	// PRIVATE METHODS.
	// ---

	// I return the URL context for the ingress into the application. This will act as
	// the prefix for external URLs.
	private getAppIngress() : string {

		// Since the demo may be running locally or on GitHub; and, using the Hash or
		// Path location strategy; we need to calculate the the ingress using the the
		// name of the demo folder that we know we're in.
		var folder = "/firebase-email-auth-angular7/";

		// Find the index of this folder in the browser URL.
		var folderIndex = window.location.href.indexOf( folder );

		// Return the URL prefix up-to and including the demo folder. This will be the
		// base off of which we append all internal app-URLs.
		return( window.location.href.slice( 0, ( folderIndex + folder.length ) ) );

	}


	private updateView() : void {

		

	}

}
