import { combineReducers } from 'redux'
import auth from './authReducer'
import alert from './alertReducer'
import theme from './themeReducer'
import profile from './profileReducer'
import status from './statusReducer'
 
import modal from './modalReducer'
 
import discover from './discoverReducer'
import suggestions from './suggestionsReducer'
import socket from './socketReducer'
import notify from './notifyReducer'
import message from './messageReducer'
import online from './onlineReducer'
import call from './callReducer'
import languageReducer from './languageReducer'
import homeUsers from './userReducer'
 
import usersActionReducer from './usersActionReducer'
import blog from './blogReducer'
import ProvaReducer from './provaReducer'
import reportReducer from './reportReducer'
import publiBlogReducer from './publiBlogReducer'
import form from './formReducer'
import { roleReducer } from './roleReducer'
import settings from './settingsReducer'
import privacy from './privacyReducer'
 
import category from './categoryReducer'
import { accordionReducer } from './accordionReducer'
 
import filter from './filterReducer.'
import carousel from './carouselReducer'
import video  from './videoReducer'
 
import image from './imageReducer'
 
import cart  from './cartReducer'
 
 
export default combineReducers({
    auth,
    alert,
    theme,
    profile,
    status,
   
    modal,
 
    discover,
    suggestions,
    socket,
    notify,
    message,
    online,
    call,
    languageReducer,
    roleReducer,
    homeUsers,
    
    usersActionReducer,
    ProvaReducer,
    reportReducer,
    publiBlogReducer,
    blog,
    form,
    settings,
    privacy,

    category,
    accordionReducer,
    filter,
    carousel,video ,cart  ,image 
})