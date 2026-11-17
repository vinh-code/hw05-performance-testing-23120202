import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const scenarios = [
  { type: "Load", threads: 20, ramp: 120, duration: 300, listenerClass: "SummaryReport", listenerName: "Summary Report", errorsOnly: false },
  { type: "Stress", threads: 60, ramp: 180, duration: 360, listenerClass: "StatVisualizer", listenerName: "Aggregate Report", errorsOnly: false },
  { type: "Spike", threads: 80, ramp: 2, duration: 120, listenerClass: "ViewResultsFullVisualizer", listenerName: "View Results Tree (errors only)", errorsOnly: true },
];

function rawBody(json) {
  const encoded = json
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <boolProp name="HTTPArgument.always_encode">false</boolProp>
                <stringProp name="Argument.value">${encoded}</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>`;
}

function queryArgument(name, value) {
  return `
          <boolProp name="HTTPSampler.postBodyRaw">false</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="${name}" elementType="HTTPArgument">
                <boolProp name="HTTPArgument.always_encode">true</boolProp>
                <stringProp name="Argument.name">${name}</stringProp>
                <stringProp name="Argument.value">${value}</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
                <boolProp name="HTTPArgument.use_equals">true</boolProp>
              </elementProp>
            </collectionProp>
          </elementProp>`;
}

function emptyArguments() {
  return `
          <boolProp name="HTTPSampler.postBodyRaw">false</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>`;
}

function codeAssertion() {
  return `
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Assert HTTP 200">
            <collectionProp name="Asserion.test_strings"><stringProp name="200">200</stringProp></collectionProp>
            <stringProp name="Assertion.custom_message">Expected HTTP 200</stringProp>
            <stringProp name="Assertion.test_field">Assertion.response_code</stringProp>
            <boolProp name="Assertion.assume_success">false</boolProp>
            <intProp name="Assertion.test_type">8</intProp>
          </ResponseAssertion>
          <hashTree/>`;
}

function textAssertion(text, name) {
  const encoded = text.replaceAll('"', "&quot;");
  return `
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="${name}">
            <collectionProp name="Asserion.test_strings"><stringProp name="expected">${encoded}</stringProp></collectionProp>
            <stringProp name="Assertion.custom_message">Expected response marker: ${encoded}</stringProp>
            <stringProp name="Assertion.test_field">Assertion.response_data</stringProp>
            <boolProp name="Assertion.assume_success">false</boolProp>
            <intProp name="Assertion.test_type">16</intProp>
          </ResponseAssertion>
          <hashTree/>`;
}

function jsonExtractor(name, pathExpression, fallback = "NOT_FOUND") {
  return `
          <JSONPostProcessor guiclass="JSONPostProcessorGui" testclass="JSONPostProcessor" testname="Extract ${name}">
            <stringProp name="JSONPostProcessor.referenceNames">${name}</stringProp>
            <stringProp name="JSONPostProcessor.jsonPathExprs">${pathExpression}</stringProp>
            <stringProp name="JSONPostProcessor.match_numbers">1</stringProp>
            <stringProp name="JSONPostProcessor.defaultValues">${fallback}</stringProp>
            <boolProp name="JSONPostProcessor.compute_concat">false</boolProp>
          </JSONPostProcessor>
          <hashTree/>`;
}

function sampler({ name, method, requestPath, body, query, assertions = [], extractors = [] }) {
  const args = body !== undefined
    ? rawBody(body)
    : query
      ? queryArgument(query.name, query.value)
      : emptyArguments();
  return `
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${name}">
          <stringProp name="HTTPSampler.domain"></stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.protocol"></stringProp>
          <stringProp name="HTTPSampler.path">${requestPath}</stringProp>
          <stringProp name="HTTPSampler.method">${method}</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>${args}
        </HTTPSamplerProxy>
        <hashTree>${codeAssertion()}${assertions.map((a) => textAssertion(a.text, a.name)).join("")}${extractors.map((e) => jsonExtractor(e.name, e.path, e.fallback)).join("")}
        </hashTree>`;
}

function saveConfig() {
  return `
          <objProp>
            <name>saveConfig</name>
            <value class="SampleSaveConfiguration">
              <time>true</time><latency>true</latency><timestamp>true</timestamp><success>true</success>
              <label>true</label><code>true</code><message>true</message><threadName>true</threadName>
              <dataType>true</dataType><encoding>false</encoding><assertions>true</assertions><subresults>true</subresults>
              <responseData>false</responseData><samplerData>false</samplerData><xml>false</xml><fieldNames>true</fieldNames>
              <responseHeaders>false</responseHeaders><requestHeaders>false</requestHeaders><responseDataOnError>true</responseDataOnError>
              <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage><assertionsResultsToSave>0</assertionsResultsToSave>
              <bytes>true</bytes><sentBytes>true</sentBytes><url>true</url><threadCounts>true</threadCounts>
              <idleTime>true</idleTime><connectTime>true</connectTime>
            </value>
          </objProp>`;
}

function threadGroupBlock({ testName, threads, ramp, duration, delay = "0", flow }) {
  return `
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="${testName}">
        <stringProp name="ThreadGroup.num_threads">${threads}</stringProp>
        <stringProp name="ThreadGroup.ramp_time">${ramp}</stringProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller">
          <intProp name="LoopController.loops">-1</intProp>
          <boolProp name="LoopController.continue_forever">false</boolProp>
        </elementProp>
        <boolProp name="ThreadGroup.scheduler">true</boolProp>
        <stringProp name="ThreadGroup.duration">${duration}</stringProp>
        <stringProp name="ThreadGroup.delay">${delay}</stringProp>
      </ThreadGroup>
      <hashTree>
        <CSVDataSet guiclass="TestBeanGUI" testclass="CSVDataSet" testname="CSV user and workflow data">
          <stringProp name="filename">\${__P(csv_path,test-data/users.csv)}</stringProp>
          <stringProp name="fileEncoding">UTF-8</stringProp>
          <stringProp name="variableNames"></stringProp>
          <boolProp name="ignoreFirstLine">true</boolProp>
          <stringProp name="delimiter">,</stringProp>
          <boolProp name="quotedData">false</boolProp>
          <boolProp name="recycle">true</boolProp>
          <boolProp name="stopThread">false</boolProp>
          <stringProp name="shareMode">shareMode.all</stringProp>
        </CSVDataSet>
        <hashTree/>
        <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP headers">
          <collectionProp name="HeaderManager.headers">
            <elementProp name="Content-Type" elementType="Header"><stringProp name="Header.name">Content-Type</stringProp><stringProp name="Header.value">application/json</stringProp></elementProp>
            <elementProp name="Accept" elementType="Header"><stringProp name="Header.name">Accept</stringProp><stringProp name="Header.value">application/json</stringProp></elementProp>
            <elementProp name="Authorization" elementType="Header"><stringProp name="Header.name">Authorization</stringProp><stringProp name="Header.value">Bearer \${token}</stringProp></elementProp>
          </collectionProp>
        </HeaderManager>
        <hashTree/>
        <OnceOnlyController guiclass="OnceOnlyControllerGui" testclass="OnceOnlyController" testname="Pin one CSV row to each VU"/>
        <hashTree>
          <JSR223Sampler guiclass="TestBeanGUI" testclass="JSR223Sampler" testname="Copy CSV values to stable VU variables">
            <stringProp name="scriptLanguage">groovy</stringProp>
            <stringProp name="parameters"></stringProp>
            <stringProp name="filename"></stringProp>
            <stringProp name="cacheKey">true</stringProp>
            <stringProp name="script">['email','password','name','phone','address','keyword'].each { key -&gt; vars.put('vu_' + key, vars.get(key)) }; SampleResult.setIgnore()</stringProp>
          </JSR223Sampler>
          <hashTree/>
        </hashTree>
        <TransactionController guiclass="TransactionControllerGui" testclass="TransactionController" testname="Flow 4 – Profile Purchase">
          <boolProp name="TransactionController.parent">false</boolProp>
          <boolProp name="TransactionController.includeTimers">true</boolProp>
        </TransactionController>
        <hashTree>
          <UniformRandomTimer guiclass="UniformRandomTimerGui" testclass="UniformRandomTimer" testname="Think time 300–1000 ms">
            <stringProp name="ConstantTimer.delay">\${__P(think_base_ms,300)}</stringProp>
            <stringProp name="RandomTimer.range">\${__P(think_random_ms,700)}</stringProp>
          </UniformRandomTimer>
          <hashTree/>${flow}
        </hashTree>
      </hashTree>`;
}

function buildPlan(scenario) {
  const flow = [
    sampler({
      name: "01 Login",
      method: "POST",
      requestPath: "/api/login",
      body: '{"email":"${vu_email}","password":"${vu_password}"}',
      assertions: [{ text: '"token"', name: "Assert token marker" }],
      extractors: [{ name: "token", path: "$.token" }],
    }),
    sampler({ name: "02 Get profile", method: "GET", requestPath: "/api/users/me" }),
    sampler({
      name: "03 Update profile",
      method: "PUT",
      requestPath: "/api/users/me",
      body: '{"name":"${vu_name}","shipping_address":"${vu_address}","phone":"${vu_phone}"}',
      assertions: [{ text: "Profile updated", name: "Assert profile updated" }],
    }),
    sampler({
      name: "04 Search products",
      method: "GET",
      requestPath: "/api/products",
      query: { name: "search", value: "${vu_keyword}" },
      assertions: [{ text: '"id"', name: "Assert product found" }],
      extractors: [
        { name: "product_id", path: "$[0].id" },
        { name: "product_name", path: "$[0].name" },
        { name: "product_price", path: "$[0].price" },
      ],
    }),
    sampler({ name: "05 Product detail", method: "GET", requestPath: "/api/products/${product_id}", assertions: [{ text: '"id"', name: "Assert product detail" }] }),
    sampler({
      name: "06 Add to cart",
      method: "POST",
      requestPath: "/api/cart",
      body: '{"id":${product_id},"name":"${product_name}","price":${product_price},"quantity":1}',
      assertions: [{ text: "Added to cart", name: "Assert cart updated" }],
    }),
    sampler({
      name: "07 Checkout",
      method: "POST",
      requestPath: "/api/checkout",
      body: '{"total_amount":${product_price},"shipping_address":"${vu_address}"}',
      assertions: [{ text: '"orderId"', name: "Assert order created" }],
      extractors: [{ name: "order_id", path: "$.orderId" }],
    }),
    sampler({ name: "08 Order detail", method: "GET", requestPath: "/api/orders/${order_id}", assertions: [{ text: '"id"', name: "Assert order detail" }] }),
  ].join("");

  const groups = scenario.type === "Spike"
    ? [
        threadGroupBlock({
          testName: "Spike baseline and recovery – Flow 4",
          threads: "${__P(baseline_threads,5)}",
          ramp: "${__P(baseline_ramp,5)}",
          duration: "${__P(duration,180)}",
          flow,
        }),
        threadGroupBlock({
          testName: "Spike burst – Flow 4",
          threads: "${__P(threads,80)}",
          ramp: "${__P(ramp,2)}",
          delay: "${__P(spike_delay,60)}",
          duration: "${__P(spike_duration,30)}",
          flow,
        }),
      ].join("")
    : threadGroupBlock({
        testName: `${scenario.type} – Flow 4 Profile Purchase`,
        threads: `\${__P(threads,${scenario.threads})}`,
        ramp: `\${__P(ramp,${scenario.ramp})}`,
        duration: `\${__P(duration,${scenario.duration})}`,
        flow,
      });

  return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="23120202_${scenario.type}_20261117">
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="Variables">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
    <hashTree>
      <ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Request Defaults">
        <elementProp name="HTTPsampler.Arguments" elementType="Arguments"><collectionProp name="Arguments.arguments"/></elementProp>
        <stringProp name="HTTPSampler.domain">localhost</stringProp>
        <stringProp name="HTTPSampler.port">3000</stringProp>
        <stringProp name="HTTPSampler.protocol">http</stringProp>
        <stringProp name="HTTPSampler.connect_timeout">5000</stringProp>
        <stringProp name="HTTPSampler.response_timeout">10000</stringProp>
      </ConfigTestElement>
      <hashTree/>
${groups}
      <ResultCollector guiclass="${scenario.listenerClass}" testclass="ResultCollector" testname="${scenario.listenerName}" enabled="true">
        <boolProp name="ResultCollector.error_logging">${scenario.errorsOnly}</boolProp>${saveConfig()}
        <stringProp name="filename"></stringProp>
      </ResultCollector>
      <hashTree/>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
`;
}

fs.mkdirSync(path.join(projectDir, "test-plans"), { recursive: true });
for (const scenario of scenarios) {
  const target = path.join(projectDir, "test-plans", `23120202_${scenario.type}_20261117.jmx`);
  fs.writeFileSync(target, buildPlan(scenario), "utf8");
  console.log(`Generated ${path.relative(projectDir, target)}`);
}

