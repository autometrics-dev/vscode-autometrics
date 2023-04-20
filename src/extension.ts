import * as vscode from "vscode";

import { MetricListProvider } from "./metricListProvider";
import { getContent } from "./content";
import { hasAutometricsDecorator } from "./decorator";
import { FunctionListProvider } from "./functionListProvider";
import { loadPrometheusProvider } from "./prometheus";

// rome-ignore lint/suspicious/noExplicitAny: WASM is supported, the types just aren't complete...
declare const WebAssembly: any;

const typescriptExtensionId = "vscode.typescript-language-features";
const tsPluginId = "@autometrics/typescript-plugin";
const configSection = "autometrics";

/**
 * Returns either a string or undefined if the document/position
 * don't justify showing a tooltip
 */
function getFunctionName(
  document: vscode.TextDocument,
  position: vscode.Position,
): string | void {
  const textLine = document.lineAt(position.line);
  const functionRegex = /^(?<indentation>\s*)def\s*(?<name>[\dA-z]+)?\s*\(/;
  const match = textLine.text.match(functionRegex);
  const name = match?.groups?.name;
  const indentation = match?.groups?.indentation ?? "";

  if (
    name &&
    position.line > 1 &&
    hasAutometricsDecorator(document, position.line - 1, indentation)
  ) {
    return name;
  }
}

function getPrometheusUrl(config: vscode.WorkspaceConfiguration): string {
  return config.prometheusUrl || "http://localhost:9090/";
}

export const PythonHover = {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const name = getFunctionName(document, position);
    if (name) {
      return new vscode.Hover(getContent(name));
    }

    return undefined;
  },
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate() {
  activatePythonSupport();
  activateTypeScriptSupport();

  activateSidebar();
}

function activatePythonSupport() {
  vscode.languages.registerHoverProvider("python", PythonHover);
}

async function activateTypeScriptSupport() {
  const tsExtension = vscode.extensions.getExtension(typescriptExtensionId);
  if (!tsExtension) {
    return;
  }

  await tsExtension.activate();

  if (!tsExtension.exports || !tsExtension.exports.getAPI) {
    return;
  }

  const tsExtensionApi = tsExtension.exports.getAPI(0);
  if (!tsExtensionApi) {
    return;
  }

  // rome-ignore lint/suspicious/noExplicitAny: pluginAPI is not typed
  function configureTSPlugin(api: any) {
    const config = vscode.workspace.getConfiguration(configSection);
    console.log(`Configuring TS plugin with ${config.prometheusUrl}`);
    api.configurePlugin(tsPluginId, {
      prometheusUrl: getPrometheusUrl(config),
    });
  }

  configureTSPlugin(tsExtensionApi);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(configSection)) {
      configureTSPlugin(tsExtensionApi);
    }
  });
}

async function activateSidebar() {
  const config = vscode.workspace.getConfiguration(configSection);
  const prometheusUrl = getPrometheusUrl(config);
  const prometheus = await loadPrometheusProvider(prometheusUrl);

  vscode.commands.registerCommand(
    "autometrics.graph.open",
    (metric: string, _labels: Record<string, string> = {}) => {
      const panel = vscode.window.createWebviewPanel(
        "autometricsGraph",
        metric,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );

      panel.webview.html = `
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <div class="sc-kCtSUc sc-ciABCq QmkGp fMOIHW">
      <div>
        <div class="sc-hXGYtH hzlLOT">
          <div class="sc-eAYsmk gtDFVc">
            <div class="sc-kyDIYZ gdPFIY">
              <div class="sc-iAUooG jAwmIc">
                <span class="sc-djdVCz jWqjoE">Type</span>
                <span class="sc-hAtEyd doKunu">
                  <button aria-label="Line chart" style="--icon-button-padding: 6px; --icon-button-width: 32px; --icon-button-height: 32px; --icon-button-icon-size: 20px; --button-normal-color: #1f2023; --button-normal-backgroundColor: transparent; --button-hover-color: #1f2023; --button-hover-backgroundColor: #e7e7e7; --button-active-color: #ffffff; --button-active-backgroundColor: #606266; --button-focus-color: #606266; --button-focus-backgroundColor: #ffffff; --button-disabled-color: #a4a4a4; --button-disabled-backgroundColor: transparent;" class="sc-kFuwaP gVrdwe iconButton active" aria-pressed="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 15.625H3.125v-2.844L7.531 8.93l4.594 3.445a.625.625 0 0 0 .79-.031l5-4.375a.625.625 0 0 0-.83-.938l-4.616 4.04-4.594-3.446a.625.625 0 0 0-.79.031l-3.96 3.469V3.75a.625.625 0 0 0-1.25 0v12.5a.625.625 0 0 0 .625.625h15a.624.624 0 1 0 0-1.25Z" fill="currentColor"></path></svg>
                  </button>
                  <button aria-label="Bar chart" style="--icon-button-padding: 6px; --icon-button-width: 32px; --icon-button-height: 32px; --icon-button-icon-size: 20px; --button-normal-color: #1f2023; --button-normal-backgroundColor: transparent; --button-hover-color: #1f2023; --button-hover-backgroundColor: #e7e7e7; --button-active-color: #ffffff; --button-active-backgroundColor: #606266; --button-focus-color: #606266; --button-focus-backgroundColor: #ffffff; --button-disabled-color: #a4a4a4; --button-disabled-backgroundColor: transparent;" class="sc-kFuwaP gVrdwe iconButton" aria-pressed="false">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.813 15.625h-.625v-12.5a.625.625 0 0 0-.625-.625h-4.375a.625.625 0 0 0-.626.625V6.25h-3.75a.625.625 0 0 0-.625.625V10h-3.75a.625.625 0 0 0-.624.625v5h-.626a.625.625 0 1 0 0 1.25h15.626a.624.624 0 1 0 0-1.25ZM8.438 7.5h3.124v8.125H8.438V7.5Zm-4.376 3.75h3.125v4.375H4.063V11.25Z" fill="currentColor"></path></svg>
                  </button>
                </span>
              </div>
              <div class="sc-iAUooG jAwmIc">
                <span class="sc-djdVCz jWqjoE">Stacking</span>
                <span class="sc-hAtEyd doKunu">
                  <button aria-label="Combined/default" style="--icon-button-padding: 6px; --icon-button-width: 32px; --icon-button-height: 32px; --icon-button-icon-size: 20px; --button-normal-color: #1f2023; --button-normal-backgroundColor: transparent; --button-hover-color: #1f2023; --button-hover-backgroundColor: #e7e7e7; --button-active-color: #ffffff; --button-active-backgroundColor: #606266; --button-focus-color: #606266; --button-focus-backgroundColor: #ffffff; --button-disabled-color: #a4a4a4; --button-disabled-backgroundColor: transparent;" class="sc-kFuwaP gVrdwe iconButton active" aria-pressed="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.157 3.794a.5.5 0 0 0-.916.011l-2.805 6.64-1.139-2.331a.5.5 0 0 0-.894-.008l-4.43 8.666a.5.5 0 0 0 .445.728h15.168a.5.5 0 0 0 .455-.706l-5.884-13Zm-.76 12.706h5.414L11.716 5.247 9.02 11.635l2.378 4.865Zm-2.894-3.643 1.78 3.643h-3.32l1.54-3.643Zm-.583-1.191L5.878 16.5H3.235l3.603-7.049 1.082 2.215Z" fill="currentColor"></path></svg>
                  </button>
                  <button aria-label="Stacked" type="button" style="--icon-button-padding: 6px; --icon-button-width: 32px; --icon-button-height: 32px; --icon-button-icon-size: 20px; --button-normal-color: #1f2023; --button-normal-backgroundColor: transparent; --button-hover-color: #1f2023; --button-hover-backgroundColor: #e7e7e7; --button-active-color: #ffffff; --button-active-backgroundColor: #606266; --button-focus-color: #606266; --button-focus-backgroundColor: #ffffff; --button-disabled-color: #a4a4a4; --button-disabled-backgroundColor: transparent;" class="sc-kFuwaP gVrdwe iconButton" aria-pressed="false">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.688 3.125a.5.5 0 0 1 .5-.5h4.374a.5.5 0 0 1 .5.5V16.25a.5.5 0 0 1-.5.5H7.885a.503.503 0 0 1-.142 0H3.438a.5.5 0 0 1-.5-.5V6.812a.5.5 0 0 1 .5-.5h3.874v-.437a.5.5 0 0 1 .5-.5h3.875v-2.25ZM7.311 7.312H3.938V11h3.376V7.312Zm0 4.688H3.938v3.75h3.376V12Zm1 3.75V6.375h3.376v9.375H8.312Zm4.376 0V3.625h3.374V15.75h-3.375Z" fill="currentColor"></path></svg>
                  </button>
                  <button aria-label="Stacked/percentage" style="--icon-button-padding: 6px; --icon-button-width: 32px; --icon-button-height: 32px; --icon-button-icon-size: 20px; --button-normal-color: #1f2023; --button-normal-backgroundColor: transparent; --button-hover-color: #1f2023; --button-hover-backgroundColor: #e7e7e7; --button-active-color: #ffffff; --button-active-backgroundColor: #606266; --button-focus-color: #606266; --button-focus-backgroundColor: #ffffff; --button-disabled-color: #a4a4a4; --button-disabled-backgroundColor: transparent;" class="sc-kFuwaP gVrdwe iconButton" aria-pressed="false">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.354 4.646a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.708-.708l10-10a.5.5 0 0 1 .708 0ZM6.5 5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm8 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm1-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" fill="currentColor"></path></svg>
                  </button>
                </span>
              </div>
            </div>
            <div class="sc-kyDIYZ gdPFIY"></div>
          </div>
          <div class="sc-gueYoa sc-jItqcz sc-elIugc cuTFDX lgmNnq lhbZiv">
            <svg width="446.5" height="275" style="cursor: grab;">
              <defs>
                <clipPath id="clip-chart"><rect x="0" y="0" width="408.5" height="255"></rect></clipPath>
              </defs>
              <g class="visx-group" transform="translate(38, 0)">
                <g class="visx-group visx-rows" transform="translate(0, 0)">
                  <line class="visx-line" x1="0" y1="231.87074829931973" x2="408.5" y2="231.87074829931973" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="202.9591836734694" x2="408.5" y2="202.9591836734694" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="174.04761904761907" x2="408.5" y2="174.04761904761907" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="145.1360544217687" x2="408.5" y2="145.1360544217687" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="116.22448979591839" x2="408.5" y2="116.22448979591839" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="87.31292517006803" x2="408.5" y2="87.31292517006803" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="58.40136054421769" x2="408.5" y2="58.40136054421769" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="29.489795918367353" x2="408.5" y2="29.489795918367353" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                  <line class="visx-line" x1="0" y1="0.5782312925170169" x2="408.5" y2="0.5782312925170169" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" height="255"></line>
                </g>
                <line x1="408.5" x2="408.5" y1="0" y2="255" stroke="#e7e7e7" stroke-width="1"></line>
                <g class="visx-group visx-columns" transform="translate(0, 0)">
                  <line class="visx-line" x1="61.79084472222222" y1="0" x2="61.79084472222222" y2="255" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" width="408.5"></line>
                  <line class="visx-line" x1="129.87417805555555" y1="0" x2="129.87417805555555" y2="255" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" width="408.5"></line>
                  <line class="visx-line" x1="197.9575113888889" y1="0" x2="197.9575113888889" y2="255" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" width="408.5"></line>
                  <line class="visx-line" x1="266.04084472222223" y1="0" x2="266.04084472222223" y2="255" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" width="408.5"></line>
                  <line class="visx-line" x1="334.12417805555555" y1="0" x2="334.12417805555555" y2="255" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" width="408.5"></line>
                  <line class="visx-line" x1="402.2075113888889" y1="0" x2="402.2075113888889" y2="255" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1" width="408.5"></line>
                </g>
                <g class="visx-group visx-axis visx-axis-bottom" transform="translate(0, 255)">
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="0" y="0" font-size="10px" style="overflow: visible;">
                      <text transform="" x="61.79084472222222" y="18" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="middle"><tspan x="61.79084472222222" dy="0px">08:40</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="0" y="0" font-size="10px" style="overflow: visible;">
                      <text transform="" x="129.87417805555555" y="18" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="middle"><tspan x="129.87417805555555" dy="0px">08:45</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="0" y="0" font-size="10px" style="overflow: visible;">
                      <text transform="" x="197.9575113888889" y="18" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="middle"><tspan x="197.9575113888889" dy="0px">08:50</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="0" y="0" font-size="10px" style="overflow: visible;">
                      <text transform="" x="266.04084472222223" y="18" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="middle"><tspan x="266.04084472222223" dy="0px">08:55</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="0" y="0" font-size="10px" style="overflow: visible;">
                      <text transform="" x="334.12417805555555" y="18" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="middle"><tspan x="334.12417805555555" dy="0px">09 AM</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="0" y="0" font-size="10px" style="overflow: visible;">
                      <text transform="" x="402.2075113888889" y="18" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="middle"><tspan x="402.2075113888889" dy="0px">09:05</tspan></text>
                    </svg>
                  </g>
                  <line class="visx-line visx-axis-line" x1="0.5" y1="0" x2="409" y2="0" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1"></line>
                </g>
                <g class="visx-group visx-axis visx-axis-left" transform="translate(0, 0)">
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="-0.25em" y="0.25em" font-size="10px" style="overflow: visible;">
                      <text transform="" x="-8" y="202.9591836734694" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="end"><tspan x="-8" dy="0px">10</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="-0.25em" y="0.25em" font-size="10px" style="overflow: visible;">
                      <text transform="" x="-8" y="174.04761904761907" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="end"><tspan x="-8" dy="0px">15</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="-0.25em" y="0.25em" font-size="10px" style="overflow: visible;">
                      <text transform="" x="-8" y="145.1360544217687" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="end"><tspan x="-8" dy="0px">20</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="-0.25em" y="0.25em" font-size="10px" style="overflow: visible;">
                      <text transform="" x="-8" y="116.22448979591839" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="end"><tspan x="-8" dy="0px">25</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="-0.25em" y="0.25em" font-size="10px" style="overflow: visible;">
                      <text transform="" x="-8" y="87.31292517006803" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="end"><tspan x="-8" dy="0px">30</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="-0.25em" y="0.25em" font-size="10px" style="overflow: visible;">
                      <text transform="" x="-8" y="58.40136054421769" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="end"><tspan x="-8" dy="0px">35</tspan></text>
                    </svg>
                  </g>
                  <g class="visx-group visx-axis-tick" transform="translate(0, 0)">
                    <svg x="-0.25em" y="0.25em" font-size="10px" style="overflow: visible;">
                      <text transform="" x="-8" y="29.489795918367353" font-family="Inter" font-style="normal" font-weight="400" font-size="10px" letter-spacing="0" fill="#a4a4a4" text-anchor="end"><tspan x="-8" dy="0px">40</tspan></text>
                    </svg>
                  </g>
                  <line class="visx-line visx-axis-line" x1="0" y1="255.5" x2="0" y2="0.5" fill="transparent" shape-rendering="crispEdges" stroke="#e7e7e7" stroke-width="1"></line>
                </g>
                <g class="visx-group" transform="translate(0, 0)" clip-path="url(#clip-chart)">
                  <g class="visx-group" transform="translate(0, 0)" opacity="1">
                    <defs>
                      <linearGradient id="xW6g9oF4WzeUSjqxfnIhvg/graph-line-0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c00eae" stop-opacity="0.15"></stop><stop offset="23%" stop-color="#c00eae" stop-opacity="0.03"></stop></linearGradient>
                    </defs>
                    <g class="visx-threshold">
                      <g>
                        <defs>
                          <clipPath id="threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-0"><path d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,255L388.59084472222224,255L361.3575113888889,255L334.12417805555555,255L306.8908447222222,255L279.65751138888885,255L252.42417805555556,255L225.1908447222222,255L197.9575113888889,255L170.72417805555557,255L143.49084472222222,255L116.25751138888889,255L89.02417805555555,255L61.79084472222222,255L34.55751138888889,255L7.3241780555555565,255L-19.909155277777778,255Z"></path></clipPath>
                        </defs>
                        <defs>
                          <clipPath id="threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-0"><path d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,0L388.59084472222224,0L361.3575113888889,0L334.12417805555555,0L306.8908447222222,0L279.65751138888885,0L252.42417805555556,0L225.1908447222222,0L197.9575113888889,0L170.72417805555557,0L143.49084472222222,0L116.25751138888889,0L89.02417805555555,0L61.79084472222222,0L34.55751138888889,0L7.3241780555555565,0L-19.909155277777778,0Z"></path></clipPath>
                        </defs>
                      </g>
                      <path class="visx-area" d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,75.7482993197279L388.59084472222224,116.22448979591839L361.3575113888889,116.22448979591839L334.12417805555555,116.22448979591839L306.8908447222222,116.22448979591839L279.65751138888885,116.22448979591839L252.42417805555556,116.22448979591839L225.1908447222222,116.22448979591839L197.9575113888889,116.22448979591839L170.72417805555557,116.22448979591839L143.49084472222222,116.22448979591839L116.25751138888889,116.22448979591839L89.02417805555555,116.22448979591839L61.79084472222222,116.22448979591839L34.55751138888889,116.22448979591839L7.3241780555555565,185.6122448979592L-19.909155277777778,255Z" stroke-width="0" clip-path="url(#threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-0)" fill="violet"></path>
                      <path class="visx-area" d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,75.7482993197279L388.59084472222224,116.22448979591839L361.3575113888889,116.22448979591839L334.12417805555555,116.22448979591839L306.8908447222222,116.22448979591839L279.65751138888885,116.22448979591839L252.42417805555556,116.22448979591839L225.1908447222222,116.22448979591839L197.9575113888889,116.22448979591839L170.72417805555557,116.22448979591839L143.49084472222222,116.22448979591839L116.25751138888889,116.22448979591839L89.02417805555555,116.22448979591839L61.79084472222222,116.22448979591839L34.55751138888889,116.22448979591839L7.3241780555555565,185.6122448979592L-19.909155277777778,255Z" stroke-width="0" clip-path="url(#threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-0)" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-0)"></path>
                    </g>
                    <path class="visx-area" d="M-19.909155277777778,255L7.3241780555555565,185.6122448979592L34.55751138888889,116.22448979591839L61.79084472222222,116.22448979591839L89.02417805555555,116.22448979591839L116.25751138888889,116.22448979591839L143.49084472222222,116.22448979591839L170.72417805555557,116.22448979591839L197.9575113888889,116.22448979591839L225.1908447222222,116.22448979591839L252.42417805555556,116.22448979591839L279.65751138888885,116.22448979591839L306.8908447222222,116.22448979591839L334.12417805555555,116.22448979591839L361.3575113888889,116.22448979591839L388.59084472222224,116.22448979591839L415.82417805555554,75.7482993197279L415.82417805555554,75.7482993197279L388.59084472222224,116.22448979591839L361.3575113888889,116.22448979591839L334.12417805555555,116.22448979591839L306.8908447222222,116.22448979591839L279.65751138888885,116.22448979591839L252.42417805555556,116.22448979591839L225.1908447222222,116.22448979591839L197.9575113888889,116.22448979591839L170.72417805555557,116.22448979591839L143.49084472222222,116.22448979591839L116.25751138888889,116.22448979591839L89.02417805555555,116.22448979591839L61.79084472222222,116.22448979591839L34.55751138888889,116.22448979591839L7.3241780555555565,185.6122448979592L-19.909155277777778,255Z" stroke="#c00eae" stroke-width="1" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-0)"></path>
                  </g>
                  <g class="visx-group" transform="translate(0, 0)" opacity="1">
                    <defs>
                      <linearGradient id="xW6g9oF4WzeUSjqxfnIhvg/graph-line-1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#23304a" stop-opacity="0.15"></stop><stop offset="23%" stop-color="#23304a" stop-opacity="0.03"></stop></linearGradient>
                    </defs>
                    <g class="visx-threshold">
                      <g>
                        <defs>
                          <clipPath id="threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-1"><path d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,255L388.59084472222224,255L361.3575113888889,255L334.12417805555555,255L306.8908447222222,255L279.65751138888885,255L252.42417805555556,255L225.1908447222222,255L197.9575113888889,255L170.72417805555557,255L143.49084472222222,255L116.25751138888889,255L89.02417805555555,255L61.79084472222222,255L34.55751138888889,255L7.3241780555555565,255L-19.909155277777778,255Z"></path></clipPath>
                        </defs>
                        <defs>
                          <clipPath id="threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-1"><path d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,0L388.59084472222224,0L361.3575113888889,0L334.12417805555555,0L306.8908447222222,0L279.65751138888885,0L252.42417805555556,0L225.1908447222222,0L197.9575113888889,0L170.72417805555557,0L143.49084472222222,0L116.25751138888889,0L89.02417805555555,0L61.79084472222222,0L34.55751138888889,0L7.3241780555555565,0L-19.909155277777778,0Z"></path></clipPath>
                        </defs>
                      </g>
                      <path class="visx-area" d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,249.21768707482994L388.59084472222224,249.21768707482994L361.3575113888889,249.21768707482994L334.12417805555555,249.21768707482994L306.8908447222222,249.21768707482994L279.65751138888885,249.21768707482994L252.42417805555556,249.21768707482994L225.1908447222222,249.21768707482994L197.9575113888889,249.21768707482994L170.72417805555557,249.21768707482994L143.49084472222222,249.21768707482994L116.25751138888889,249.21768707482994L89.02417805555555,249.21768707482994L61.79084472222222,249.21768707482994L34.55751138888889,249.21768707482994L7.3241780555555565,249.21768707482994L-19.909155277777778,255Z" stroke-width="0" clip-path="url(#threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-1)" fill="violet"></path>
                      <path class="visx-area" d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,249.21768707482994L388.59084472222224,249.21768707482994L361.3575113888889,249.21768707482994L334.12417805555555,249.21768707482994L306.8908447222222,249.21768707482994L279.65751138888885,249.21768707482994L252.42417805555556,249.21768707482994L225.1908447222222,249.21768707482994L197.9575113888889,249.21768707482994L170.72417805555557,249.21768707482994L143.49084472222222,249.21768707482994L116.25751138888889,249.21768707482994L89.02417805555555,249.21768707482994L61.79084472222222,249.21768707482994L34.55751138888889,249.21768707482994L7.3241780555555565,249.21768707482994L-19.909155277777778,255Z" stroke-width="0" clip-path="url(#threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-1)" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-1)"></path>
                    </g>
                    <path class="visx-area" d="M-19.909155277777778,255L7.3241780555555565,249.21768707482994L34.55751138888889,249.21768707482994L61.79084472222222,249.21768707482994L89.02417805555555,249.21768707482994L116.25751138888889,249.21768707482994L143.49084472222222,249.21768707482994L170.72417805555557,249.21768707482994L197.9575113888889,249.21768707482994L225.1908447222222,249.21768707482994L252.42417805555556,249.21768707482994L279.65751138888885,249.21768707482994L306.8908447222222,249.21768707482994L334.12417805555555,249.21768707482994L361.3575113888889,249.21768707482994L388.59084472222224,249.21768707482994L415.82417805555554,249.21768707482994L415.82417805555554,249.21768707482994L388.59084472222224,249.21768707482994L361.3575113888889,249.21768707482994L334.12417805555555,249.21768707482994L306.8908447222222,249.21768707482994L279.65751138888885,249.21768707482994L252.42417805555556,249.21768707482994L225.1908447222222,249.21768707482994L197.9575113888889,249.21768707482994L170.72417805555557,249.21768707482994L143.49084472222222,249.21768707482994L116.25751138888889,249.21768707482994L89.02417805555555,249.21768707482994L61.79084472222222,249.21768707482994L34.55751138888889,249.21768707482994L7.3241780555555565,249.21768707482994L-19.909155277777778,255Z" stroke="#23304a" stroke-width="1" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-1)"></path>
                  </g>
                  <g class="visx-group" transform="translate(0, 0)" opacity="1">
                    <defs>
                      <linearGradient id="xW6g9oF4WzeUSjqxfnIhvg/graph-line-2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#cf3411" stop-opacity="0.15"></stop><stop offset="23%" stop-color="#cf3411" stop-opacity="0.03"></stop></linearGradient>
                    </defs>
                    <g class="visx-threshold">
                      <g>
                        <defs>
                          <clipPath id="threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-2"><path d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,255L388.59084472222224,255L361.3575113888889,255L334.12417805555555,255L306.8908447222222,255L279.65751138888885,255L252.42417805555556,255L225.1908447222222,255L197.9575113888889,255L170.72417805555557,255L143.49084472222222,255L116.25751138888889,255L89.02417805555555,255L61.79084472222222,255L34.55751138888889,255L7.3241780555555565,255L-19.909155277777778,255Z"></path></clipPath>
                        </defs>
                        <defs>
                          <clipPath id="threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-2"><path d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,0L388.59084472222224,0L361.3575113888889,0L334.12417805555555,0L306.8908447222222,0L279.65751138888885,0L252.42417805555556,0L225.1908447222222,0L197.9575113888889,0L170.72417805555557,0L143.49084472222222,0L116.25751138888889,0L89.02417805555555,0L61.79084472222222,0L34.55751138888889,0L7.3241780555555565,0L-19.909155277777778,0Z"></path></clipPath>
                        </defs>
                      </g>
                      <path class="visx-area" d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,12.142857142857157L388.59084472222224,81.53061224489797L361.3575113888889,81.53061224489797L334.12417805555555,81.53061224489797L306.8908447222222,81.53061224489797L279.65751138888885,81.53061224489797L252.42417805555556,81.53061224489797L225.1908447222222,81.53061224489797L197.9575113888889,81.53061224489797L170.72417805555557,81.53061224489797L143.49084472222222,81.53061224489797L116.25751138888889,81.53061224489797L89.02417805555555,81.53061224489797L61.79084472222222,81.53061224489797L34.55751138888889,81.53061224489797L7.3241780555555565,168.265306122449L-19.909155277777778,249.21768707482994Z" stroke-width="0" clip-path="url(#threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-2)" fill="violet"></path>
                      <path class="visx-area" d="M-19.909155277777778,260.78231292517006L7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,12.142857142857157L388.59084472222224,81.53061224489797L361.3575113888889,81.53061224489797L334.12417805555555,81.53061224489797L306.8908447222222,81.53061224489797L279.65751138888885,81.53061224489797L252.42417805555556,81.53061224489797L225.1908447222222,81.53061224489797L197.9575113888889,81.53061224489797L170.72417805555557,81.53061224489797L143.49084472222222,81.53061224489797L116.25751138888889,81.53061224489797L89.02417805555555,81.53061224489797L61.79084472222222,81.53061224489797L34.55751138888889,81.53061224489797L7.3241780555555565,168.265306122449L-19.909155277777778,249.21768707482994Z" stroke-width="0" clip-path="url(#threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-2)" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-2)"></path>
                    </g>
                    <path class="visx-area" d="M-19.909155277777778,249.21768707482994L7.3241780555555565,168.265306122449L34.55751138888889,81.53061224489797L61.79084472222222,81.53061224489797L89.02417805555555,81.53061224489797L116.25751138888889,81.53061224489797L143.49084472222222,81.53061224489797L170.72417805555557,81.53061224489797L197.9575113888889,81.53061224489797L225.1908447222222,81.53061224489797L252.42417805555556,81.53061224489797L279.65751138888885,81.53061224489797L306.8908447222222,81.53061224489797L334.12417805555555,81.53061224489797L361.3575113888889,81.53061224489797L388.59084472222224,81.53061224489797L415.82417805555554,12.142857142857157L415.82417805555554,12.142857142857157L388.59084472222224,81.53061224489797L361.3575113888889,81.53061224489797L334.12417805555555,81.53061224489797L306.8908447222222,81.53061224489797L279.65751138888885,81.53061224489797L252.42417805555556,81.53061224489797L225.1908447222222,81.53061224489797L197.9575113888889,81.53061224489797L170.72417805555557,81.53061224489797L143.49084472222222,81.53061224489797L116.25751138888889,81.53061224489797L89.02417805555555,81.53061224489797L61.79084472222222,81.53061224489797L34.55751138888889,81.53061224489797L7.3241780555555565,168.265306122449L-19.909155277777778,249.21768707482994Z" stroke="#cf3411" stroke-width="1" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-2)"></path>
                  </g>
                  <g class="visx-group" transform="translate(0, 0)" opacity="1">
                    <defs>
                      <linearGradient id="xW6g9oF4WzeUSjqxfnIhvg/graph-line-3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5f4509" stop-opacity="0.15"></stop><stop offset="23%" stop-color="#5f4509" stop-opacity="0.03"></stop></linearGradient>
                    </defs>
                    <g class="visx-threshold">
                      <g>
                        <defs>
                          <clipPath id="threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-3"><path d="M7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,255L388.59084472222224,255L361.3575113888889,255L334.12417805555555,255L306.8908447222222,255L279.65751138888885,255L252.42417805555556,255L225.1908447222222,255L197.9575113888889,255L170.72417805555557,255L143.49084472222222,255L116.25751138888889,255L89.02417805555555,255L61.79084472222222,255L34.55751138888889,255L7.3241780555555565,255Z"></path></clipPath>
                        </defs>
                        <defs>
                          <clipPath id="threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-3"><path d="M7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,0L388.59084472222224,0L361.3575113888889,0L334.12417805555555,0L306.8908447222222,0L279.65751138888885,0L252.42417805555556,0L225.1908447222222,0L197.9575113888889,0L170.72417805555557,0L143.49084472222222,0L116.25751138888889,0L89.02417805555555,0L61.79084472222222,0L34.55751138888889,0L7.3241780555555565,0Z"></path></clipPath>
                        </defs>
                      </g>
                      <path class="visx-area" d="M7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,255L388.59084472222224,255L361.3575113888889,255L334.12417805555555,255L306.8908447222222,255L279.65751138888885,255L252.42417805555556,255L225.1908447222222,255L197.9575113888889,255L170.72417805555557,255L143.49084472222222,255L116.25751138888889,255L89.02417805555555,255L61.79084472222222,255L34.55751138888889,255L7.3241780555555565,255Z" stroke-width="0" clip-path="url(#threshold-clip-below-xW6g9oF4WzeUSjqxfnIhvg/graph-3)" fill="violet"></path>
                      <path class="visx-area" d="M7.3241780555555565,260.78231292517006L34.55751138888889,260.78231292517006L61.79084472222222,260.78231292517006L89.02417805555555,260.78231292517006L116.25751138888889,260.78231292517006L143.49084472222222,260.78231292517006L170.72417805555557,260.78231292517006L197.9575113888889,260.78231292517006L225.1908447222222,260.78231292517006L252.42417805555556,260.78231292517006L279.65751138888885,260.78231292517006L306.8908447222222,260.78231292517006L334.12417805555555,260.78231292517006L361.3575113888889,260.78231292517006L388.59084472222224,260.78231292517006L415.82417805555554,260.78231292517006L415.82417805555554,255L388.59084472222224,255L361.3575113888889,255L334.12417805555555,255L306.8908447222222,255L279.65751138888885,255L252.42417805555556,255L225.1908447222222,255L197.9575113888889,255L170.72417805555557,255L143.49084472222222,255L116.25751138888889,255L89.02417805555555,255L61.79084472222222,255L34.55751138888889,255L7.3241780555555565,255Z" stroke-width="0" clip-path="url(#threshold-clip-above-xW6g9oF4WzeUSjqxfnIhvg/graph-3)" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-3)"></path>
                    </g>
                    <path class="visx-area" d="M7.3241780555555565,255L34.55751138888889,255L61.79084472222222,255L89.02417805555555,255L116.25751138888889,255L143.49084472222222,255L170.72417805555557,255L197.9575113888889,255L225.1908447222222,255L252.42417805555556,255L279.65751138888885,255L306.8908447222222,255L334.12417805555555,255L361.3575113888889,255L388.59084472222224,255L415.82417805555554,255L415.82417805555554,255L388.59084472222224,255L361.3575113888889,255L334.12417805555555,255L306.8908447222222,255L279.65751138888885,255L252.42417805555556,255L225.1908447222222,255L197.9575113888889,255L170.72417805555557,255L143.49084472222222,255L116.25751138888889,255L89.02417805555555,255L61.79084472222222,255L34.55751138888889,255L7.3241780555555565,255Z" stroke="#5f4509" stroke-width="1" fill="url(#xW6g9oF4WzeUSjqxfnIhvg/graph-line-3)"></path>
                  </g>
                  <rect class="visx-bar" width="408.5" height="255" fill="transparent"></rect>
                </g>
              </g>
            </svg>
          </div>
          <div class="sc-gueYoa sc-jItqcz sc-CQMxN cuTFDX lgmNnq eSrbNu">
            <div class="sc-ftefQL TBiFL">
              <div style="position: relative; height: 168px; width: 100%; overflow: auto; will-change: transform; direction: ltr;">
                <div style="height: 168px; width: 100%;">
                  <div style="position: absolute; left: 0px; top: 0px; height: 42px; width: 100%;">
                    <div>
                      <div class="sc-gueYoa sc-btijOp cuTFDX fDJaBz">
                        <div color="#c00eae" class="sc-gKYCAw deWF">
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.125 15a.665.665 0 0 1-.445-.18l-4.375-4.375a.633.633 0 0 1 .89-.89l3.93 3.937L16.43 5.18a.633.633 0 0 1 .89.89l-8.75 8.75a.665.665 0 0 1-.445.18Z" fill="currentColor"></path></svg>
                        </div>
                        <div class="sc-kKUyCS dBnjpq">
                          ${metric}: <span class="">channel: <span class="sc-beqWaB iyLSXk">apply_operation</span></span>,
                          <span class="">instance: localhost:3030</span>,
                          <span class="">job: my-app</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style="position: absolute; left: 0px; top: 42px; height: 42px; width: 100%;">
                    <div>
                      <div class="sc-gueYoa sc-btijOp cuTFDX fDJaBz"><div color="#23304a" class="sc-gKYCAw hexFhJ">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.125 15a.665.665 0 0 1-.445-.18l-4.375-4.375a.633.633 0 0 1 .89-.89l3.93 3.937L16.43 5.18a.633.633 0 0 1 .89.89l-8.75 8.75a.665.665 0 0 1-.445.18Z" fill="currentColor"></path></svg>
                      </div>
                        <div class="sc-kKUyCS dBnjpq">
                          ${metric}: <span class="">channel: <span class="sc-beqWaB iyLSXk">subscriber_added</span></span>,
                          <span class="">instance: localhost:3030</span>,
                          <span class="">job: my-app</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style="position: absolute; left: 0px; top: 84px; height: 42px; width: 100%;">
                    <div>
                      <div class="sc-gueYoa sc-btijOp cuTFDX fDJaBz">
                        <div color="#cf3411" class="sc-gKYCAw btWlAN">
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.125 15a.665.665 0 0 1-.445-.18l-4.375-4.375a.633.633 0 0 1 .89-.89l3.93 3.937L16.43 5.18a.633.633 0 0 1 .89.89l-8.75 8.75a.665.665 0 0 1-.445.18Z" fill="currentColor"></path></svg>
                        </div>
                        <div class="sc-kKUyCS dBnjpq">
                          ${metric}: <span class="">channel: <span class="sc-beqWaB iyLSXk">subscriber_changed_focus</span></span>,
                          <span class="">instance: localhost:3030</span>,
                          <span class="">job: my-app</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style="position: absolute; left: 0px; top: 126px; height: 42px; width: 100%;">
                    <div>
                      <div class="sc-gueYoa sc-btijOp cuTFDX fDJaBz">
                        <div color="#5f4509" class="sc-gKYCAw KfzFJ">
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.125 15a.665.665 0 0 1-.445-.18l-4.375-4.375a.633.633 0 0 1 .89-.89l3.93 3.937L16.43 5.18a.633.633 0 0 1 .89.89l-8.75 8.75a.665.665 0 0 1-.445.18Z" fill="currentColor"></path></svg>
                        </div>
                        <div class="sc-kKUyCS dBnjpq">
                          ${metric}: <span class="">channel: <span class="sc-beqWaB iyLSXk">subscriber_removed</span></span>,
                          <span class="">instance: localhost:3030</span>,
                          <span class="">job: my-app</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sc-fUHfjU zsBeD">
              <span class="sc-fNGOfv jSJEvU">4 Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;
    },
  );

  const functionListProvider = new FunctionListProvider(prometheus);
  vscode.window.registerTreeDataProvider("functionList", functionListProvider);

  const metricListProvider = new MetricListProvider(prometheus);
  vscode.window.registerTreeDataProvider("metricList", metricListProvider);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(configSection)) {
      const config = vscode.workspace.getConfiguration(configSection);
      const prometheusUrl = getPrometheusUrl(config);
      prometheus.setUrl(prometheusUrl);
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
