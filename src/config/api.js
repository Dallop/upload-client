// import { configureApiMiddleware } from 'redux-axios-api-middleware'
// import { CALL_API } from 'App/state/actions'

import firebase from 'firebase'
import 'firebase/firestore'
firebase.initializeApp({
  apiKey: 'AIzaSyA2tuaFSWaaura4F7L7KPPPueP4W9PxBrc',
  authDomain: 'boostly-84933.firebaseapp.com',
  projectId: 'boostly-84933'
})

export default firebase.firestore()
