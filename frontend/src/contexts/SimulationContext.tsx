import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  SimulationConfig,
  SimulationMetrics,
  SimulationStatus,
  RoadNetwork,
  SimulationTemplate,
} from "../types";

interface SimulationState {
  currentSimulation: SimulationStatus | null;
  roadNetwork: RoadNetwork | null;
  simulationConfig: SimulationConfig | null;
  templates: SimulationTemplate[];
  isLoading: boolean;
  error: string | null;
}

type SimulationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ROAD_NETWORK"; payload: RoadNetwork }
  | { type: "SET_SIMULATION_CONFIG"; payload: SimulationConfig }
  | { type: "START_SIMULATION"; payload: string }
  | { type: "UPDATE_METRICS"; payload: SimulationMetrics }
  | { type: "STOP_SIMULATION" }
  | { type: "SET_TEMPLATES"; payload: SimulationTemplate[] }
  | { type: "CLEAR_SIMULATION" };

const initialState: SimulationState = {
  currentSimulation: null,
  roadNetwork: null,
  simulationConfig: null,
  templates: [],
  isLoading: false,
  error: null,
};

const simulationReducer = (
  state: SimulationState,
  action: SimulationAction
): SimulationState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_ROAD_NETWORK":
      return { ...state, roadNetwork: action.payload };

    case "SET_SIMULATION_CONFIG":
      return { ...state, simulationConfig: action.payload };

    case "START_SIMULATION":
      return {
        ...state,
        currentSimulation: {
          simulation_id: action.payload,
          status: "running",
          message: "Simulation started successfully",
        },
        error: null,
      };

    case "UPDATE_METRICS":
      return {
        ...state,
        currentSimulation: state.currentSimulation
          ? {
              ...state.currentSimulation,
              metrics: action.payload,
            }
          : null,
      };

    case "STOP_SIMULATION":
      return {
        ...state,
        currentSimulation: state.currentSimulation
          ? {
              ...state.currentSimulation,
              status: "completed",
              message: "Simulation completed",
            }
          : null,
      };

    case "SET_TEMPLATES":
      return { ...state, templates: action.payload };

    case "CLEAR_SIMULATION":
      return {
        ...state,
        currentSimulation: null,
        roadNetwork: null,
        simulationConfig: null,
      };

    default:
      return state;
  }
};

interface SimulationContextType {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  startSimulation: (config: SimulationConfig) => Promise<void>;
  stopSimulation: () => Promise<void>;
  updateMetrics: (metrics: SimulationMetrics) => void;
  setRoadNetwork: (network: RoadNetwork) => void;
  setSimulationConfig: (config: SimulationConfig) => void;
  loadTemplates: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined
);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  const startSimulation = async (config: SimulationConfig) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // In a real app, you'd make an API call here
      const simulationId = `sim_${Date.now()}`;

      dispatch({ type: "START_SIMULATION", payload: simulationId });
      dispatch({ type: "SET_SIMULATION_CONFIG", payload: config });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to start simulation",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const stopSimulation = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // In a real app, you'd make an API call here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      dispatch({ type: "STOP_SIMULATION" });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to stop simulation",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateMetrics = (metrics: SimulationMetrics) => {
    dispatch({ type: "UPDATE_METRICS", payload: metrics });
  };

  const setRoadNetwork = (network: RoadNetwork) => {
    dispatch({ type: "SET_ROAD_NETWORK", payload: network });
  };

  const setSimulationConfig = (config: SimulationConfig) => {
    dispatch({ type: "SET_SIMULATION_CONFIG", payload: config });
  };

  const loadTemplates = async () => {
    try {
      // In a real app, you'd fetch from API
      const mockTemplates: SimulationTemplate[] = [
        {
          name: "Urban Intersection",
          description: "Standard 4-way intersection with traffic lights",
          vehicles_per_hour: 1500,
          car_percentage: 85.0,
          truck_percentage: 15.0,
          peak_hour_factor: 1.2,
          signal_control: "fixed_time",
          green_time: 30,
          yellow_time: 3,
          red_time: 30,
        },
        {
          name: "Highway Merge",
          description: "Highway on-ramp merge scenario",
          vehicles_per_hour: 3000,
          car_percentage: 90.0,
          truck_percentage: 10.0,
          peak_hour_factor: 1.5,
          signal_control: "actuated",
          green_time: 45,
          yellow_time: 3,
          red_time: 20,
        },
        {
          name: "Roundabout",
          description: "Multi-lane roundabout intersection",
          vehicles_per_hour: 800,
          car_percentage: 80.0,
          truck_percentage: 20.0,
          peak_hour_factor: 1.0,
          signal_control: "adaptive",
          green_time: 60,
          yellow_time: 3,
          red_time: 0,
        },
      ];

      dispatch({ type: "SET_TEMPLATES", payload: mockTemplates });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load templates" });
    }
  };

  const value: SimulationContextType = {
    state,
    dispatch,
    startSimulation,
    stopSimulation,
    updateMetrics,
    setRoadNetwork,
    setSimulationConfig,
    loadTemplates,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};
