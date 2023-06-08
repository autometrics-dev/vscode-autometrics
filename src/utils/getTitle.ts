import type { PanelOptions } from "../chartPanel";

export function getTitle(options: PanelOptions) {
  switch (options.type) {
    case "called_by":
      return `Called by ${options.functionName}`;
    case "function":
      if (options.moduleName) {
        return `${options.moduleName}::${options.functionName}`;
      }
      return options.functionName;
    case "metric":
      return options.metricName;
    case "function_graphs":
      return options.functionName;
  }
}
