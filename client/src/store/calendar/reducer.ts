/* eslint-disable no-case-declarations */
import {CalendarTypes,CalendarState} from "./actionTypes"

export const INIT_STATE : CalendarState = {
  events: [],
  categories: [],
  error: {},
}

const Calendar = (state = INIT_STATE, action : any) => {
  switch (action.type) {
    case CalendarTypes.API_SUCCESS:
      switch (action.payload.actionType) {
        case CalendarTypes.GET_EVENTS:
          return {
            ...state,
            events: action.payload.data,
          };

        case CalendarTypes.ADD_NEW_EVENT:
          return {
            ...state,
            events: [...state.events, action.payload.data],
          }

        default:
          return { ...state };
      }
    case CalendarTypes.API_FAIL:
      switch (action.payload.actionType) {
        case CalendarTypes.GET_EVENTS:
          return {
            ...state,
            events: action.payload.error,
          };

        case CalendarTypes.ADD_NEW_EVENT:
          return {
            ...state,
            events: action.payload.error,
          };

        default:
          return { ...state };
      }
    case CalendarTypes.UPDATE_EVENT_SUCCESS:
      return {
        ...state,
        events: state.events.map(event =>
          event.id.toString() === action.payload.id.toString()
            ? { event, ...action.payload }
            : event
        ),
        isEventUpdated : true
      }

    case CalendarTypes.UPDATE_EVENT_FAIL:
      return {
        ...state,
        error: action.payload,
      }

    case CalendarTypes.DELETE_EVENT_SUCCESS:
      return {
        ...state,
        events: state.events.filter(
          event => event.id.toString() !== action.payload.id.toString()
        ),
      }

    case CalendarTypes.DELETE_EVENT_FAIL:
      return {
        ...state,
        error: action.payload,
      }

    case CalendarTypes.GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload,
      }

    case CalendarTypes.GET_CATEGORIES_FAIL:
      return {
        ...state,
        error: action.payload,
      }
    case CalendarTypes.RESET_CALENDAR:
      const flag = action.payload.flag;
      const value = action.payload.value;
      const flags : any = {};
      flags[flag] = value;
      return {
        ...state,
        ...flags
      }

    default:
      return state
  }
}

export default Calendar
