---
slug: getting-started-k8s-lab
type: challenge
title: Getting Started with Kubernetes Observability
tabs:
- title: Terminal
  type: terminal
  hostname: control-plane
- title: IDE
  type: service
  hostname: control-plane
  path: /
  port: 8080
- title: Storedog
  type: service
  hostname: worker
  path: /
  port: 30001
  new_window: true
- title: Datadog
  type: website
  url: https://app.datadoghq.com
  new_window: true
- title: Help
  type: website
  url: https://datadoghq.dev/training-lab-support?sandboxId=${_SANDBOX_ID}
difficulty: basic
---

Welcome! Your lab environment is warming up. This will take about 3 minutes for all interactive functionality to be available.

In this lab, you’ll take on the role of a **Site Reliability Engineer (SRE)**. Your mission is to implement Datadog on an existing Kubernetes cluster and report back on the new observability capabilities you discover.

Kubernetes environments can be complex and opaque, making it difficult to find and fix problems quickly. To act with confidence, you need fast, clear insights. With Datadog, you get real-time visibility into every layer of your stack—from nodes to pods to services. In this lab, you'll see how.

This diagram will be referenced throughout the course to guide your learning journey.

`[Kubernetes Cluster] → [Datadog Agent] → [Metrics / Logs / Traces] → [Dashboards]`

By the end of this lab, you will be able to:

* Deploy the Datadog Agent on a Kubernetes cluster using Operator or Helm.
* Use built-in dashboards to assess cluster and workload health.
* Investigate performance issues using node/pod metrics and logs.
* Trace a request through multiple services to pinpoint slow operations.

[Install] Datadog Agent
===

As an SRE, your first task is to get data flowing from your Kubernetes cluster into Datadog. You'll accomplish this by installing Datadog Agents, which are lightweight processes that collect metrics, logs, and traces from every node in your cluster. Let's see how quickly these Datadog Agents can provide end-to-end observability.

### Quick Orientation

A **Kubernetes cluster** is a group of machines, physical or virtual, called **nodes** that work together to run containerized applications. These applications are called **workloads**, and they include components like pods, services, and other resources.

At the heart of the cluster is the **control plane**. This is the "brain" of Kubernetes. The control plane makes decisions about scheduling workloads, responding to changes, and managing the desired state of the system. The control plane includes components like the API server, scheduler, controller manager, and etcd.

To monitor a Kubernetes cluster effectively, Datadog uses two types of agents:
- Datadog Node Agent – Runs on each individual node and collects data about the node itself and the workloads running there.
- Datadog Cluster Agent – Communicates with the control plane (especially the API server) to gather cluster-level data and serve it to the Datadog Node Agents when needed.

The diagram below shows where each of the respective Datadog agents run within a Kubernetes architecture.

![High-level Kubernetes component diagram with respective Datadog cluster agent and node agent components.](../assets/kubernetes_cluster_agent_diagram.png)

### Install the Agent

1.  First, verify that your Kubernetes cluster is running and accessible. In the **[Terminal](tab-0)**, run:

    ```run,bash
    kubectl get nodes
    ```

    You will see the status of your cluster's nodes. Let's update our map! We've confirmed our starting point.

    `**✅[Kubernetes Cluster]** → [Datadog Agent] → [Metrics / Logs / Traces] → [Dashboards]`

2.  Add the official Datadog Helm repository. This gives you access to the Datadog Agent chart.

    ```run,bash
    helm repo add datadog https://helm.datadoghq.com
    helm repo update
    ```

3. Install the Datadog Operator with Helm.

  ```run, bash
    helm install my-datadog-operator datadog/datadog-operator
  ```

4. Create a Kubernetes secret with your Datadog API and app keys.

    > **Note**: In a real-world scenario, you would replace `<YOUR_API_KEY>` with your actual key from your Datadog account. For this lab, it is pre-configured for you.

    ```run,bash
    kubectl create secret generic datadog-secret \
      --from-literal api-key=$DD_API_KEY \
      --from-literal app-key=$DD_APP_KEY
    ```

5.  Now, install the Datadog Agent using the supplied `datadog-agent.yaml` manifest file.

    > **Note**: Datadog supports two installation methods for Kubernetes clusters; Operator and Helm. Operator is the recommended installation because...

<details open>
<summary>Operator install method</summary>

```run,bash
kubectl apply -f datadog/datadog-agent.yaml
```

<details open>
<summary>Optional: Review datadog-agent.yaml</summary>

* Review the datadog-agent.yaml file here.

</details>


</details>

<details>
<summary>Helm install method</summary>

```run,bash
helm install datadog-agent -f datadog-agent.yaml datadog/datadog
```

<details open>
<summary>Optional: Review datadog-agent.yaml</summary>

* Review the datadog-agent.yaml file here.

</details>

</details>

Helm will now deploy the Agent as a DaemonSet, ensuring it runs on every node. 

You are moving along in your journey! Now that the agents are installed, they will begin sending data from your Kubernetes cluster to Datadog.

`[Kubernetes Cluster] → **✅[Datadog Agent]** → [Metrics / Logs / Traces] → [Dashboards]`

### Verify data is flowing

To verify that data is flowing from your cluster to Datadog, begin by logging into your lab Datadog instance.

1. Use the Datadog credentials below to sign in to your lab **[Datadog account](https://app.datadoghq.com/)**. 

   Datadog username

   ```
   [[ Instruqt-Var key="LABVAR_DD_USER" hostname="lab-host" ]]
   ```

   Datadog password

   ```
   [[ Instruqt-Var key="LABVAR_DD_PASSWORD" hostname="lab-host" ]]
   ```

    > [!NOTE]
    > These credentials are also printed in the **[lab terminal](tab-0)**. Use the `creds` command to redisplay your Datadog credentials if needed.
    > ```run,bash
    >  creds
    > ```

2. In Datadog, hover over **Infrastructure** in the sidebar navigation pane and click **[Kubernetes Overview](https://app.datadoghq.com/kubernetes)**. If the Datadog installation in your cluster was successful, you will see your nodes and pods appear in the overview similar to the screenshot below.

![High-level Kubernetes component diagram with respective Datadog cluster agent and node agent components.](../assets/kubernetes_overview.png)

Data is now flowing! You have arrived at this point in your journey.

`[Kubernetes Cluster] → [Datadog Agent] → **✅[Metrics / Logs / Traces]** → [Dashboards]`

With Datadog Agent installed and observability data ingestion verified, proceed to the next step to begin visualizing your data with built-in dashboards.

[Dashboards] Navigate Cluster & Workload Dashboards
===

Now that your cluster is reporting data, you will explore Datadog’s out-of-the-box dashboards to get a high-level view of your environment. These dashboards provide instant value by helping you spot issues across your cluster without needing to write a single query.

### Explore Kubernetes cluster data

In this section you'll explore some of the cluster-level data the Datadog Cluster Agent gathers from your Kubernetes control plane.

1. In your Datadog instance's sidebar menu, hover over **Dashboards**, then click **Dashboard List** to navigate to the [Dashboard List](https://app.datadoghq.com/dashboard/lists) page.

2. In the search bar, type in `Kubernetes Cluster Overview Dashboard`, then click the [Kubernetes Cluster Overview Dashboard](https://app.datadoghq.com/dash/integration/30589/kubernetes-cluster-overview-dashboard) that appears.

3.  Take a moment to explore the widgets. Can you identify the widgets showing overall **CPU and memory usage** for the cluster?

4.  Try filtering the entire dashboard by a specific `namespace` or `node` using the dropdown menus at the top.

    You are now visualizing the organized Kubernetes cluster-level data coming from your Datadog agents.

    `[Kubernetes Cluster] → [Datadog Agent] → [Metrics / Logs / Traces] → **✅[Dashboards]**`

### Explore Kubernetes workload data

In this section you'll explore some of the workload-level data the Datadog Node Agent gathers from your Kubernetes nodes.

1.  In your Datadog instance, press `Cmd+k` on Mac or `Ctrl+k` on Windows/Linux to open the quick nav menu. In the quick nav menu, type in `Kubernetes Pods Overview Dashboard` and press `Enter`.

  > **Pro Tip:** Quick nav makes it easier and faster to navigate between your key resources within Datadog.

2.  This dashboard focuses on your applications. Look for widgets that show per-pod metrics, replica status, and container errors.
3.  Which widgets on this dashboard would help you identify if a deployment is experiencing CPU throttling?

  > **Pro Tip:** Dashboards give you the "zoomed-out" view of your cluster health. Use them as your first stop when something feels 'off.'

Now that you’ve seen the big picture, let’s dig deeper into the details. In the next step, you’ll explore granular metrics for nodes and pods to pinpoint where issues may be hiding.

[Metrics] Explore Node & Pod metrics in the Infra UI
===

Dashboards are great for overviews, but sometimes you need to get your hands on the raw data to diagnose cluster behavior. 

In your SRE role, you recently heard from your support team that your e-commerce users are reporting slowness throughout the site. It's time to investigate deeper to find the root cause.

`[Kubernetes Cluster] → [Datadog Agent] → **[✅Metrics / Logs / Traces]** → [Dashboards]`

### Investigate Node & Pod Metrics

1.  In your Datadog instance, navigate to **Kubernetes Pods Overview** dashboard. This dashboard is a great place to begin troubleshooting because it gives you broad visibility into the scale, status, and resource usage of your cluster and its containers.
  
2.  Click on the **Nodes** tab at the top. You'll see a list of all nodes in your cluster. Click on one to open the details panel.
3.  In the details panel, hover over the timeseries graphs for **CPU Usage**, **Memory Usage**, and **Network I/O**. This gives you the raw data needed to identify resource contention.
4.  Now, click on the **Pods** tab. Find a pod associated with the `frontend` service.
5.  Click on the pod to open its details panel. Here, you can identify which specific container inside the pod is consuming the most CPU or memory. You can also see important metadata and events related to the pod.

**EXERCISE**: Find the container running in the worker Node with the highest memory usage.

<details>
<summary>Answer</summary>
<p><span>

Filter by `kube_node:worker`, and sort by the RSS Memory column:

![Container with highest memory usage](../assets/frontend_memory.png)

</span></p>
</details>

You’ve spotted a potential issue using metrics - now it’s time to investigate why it’s happening. In the next step, you’ll use logs to confirm suspicions and uncover root causes.

[Logs] View and Filter Container Logs
===

Metrics tell you *what* is happening, but logs tell you *why*. Logs provide real-time context behind the metrics you see. With Datadog's log management, you can quickly filter and search across all your container logs to pinpoint crashes, timeouts, and configuration issues.

`[Kubernetes Cluster] → [Datadog Agent] → [Metrics / **✅Logs** / Traces] → [Dashboards]`

### Find the Right Log

Metrics from the previous step suggested a pod in the `frontend` service was overusing CPU. Let's inspect its logs to see what's going on.

1.  In your Datadog lab instance, navigate to **Logs > Live Tail**.
2.  In the search bar at the top, filter the logs to show only the container you're interested in. Type: `service:frontend`.
3.  The logs are now filtered. Look for any error messages, stack traces, or unusual activity that might explain the high CPU usage. Explore the timestamps, log levels (`INFO`, `ERROR`, etc.), and message content.

> [!NOTE]
> **Pro Tip:** Use log search to confirm suspicions raised by metrics. Errors, high latency, or frequent restarts often show up in the logs first.

You now have metrics and logs working together. To complete your observability toolkit, you’ll follow a real request through your services using APM tracing so you can see latency, bottlenecks, and dependencies in action.

[Traces] Trace a Sample Request with APM
===

Metrics and logs are powerful, but what about the connections *between* your microservices? Application Performance Monitoring (APM) traces help you understand how services interact. With a trace, you can follow a single request from end to end and see where time is spent, where requests fail, and which dependencies are slowing things down.

`[Kubernetes Cluster] → [Datadog Agent] → [Metrics / Logs / **✅Traces**] → [Dashboards]`

### Trace a Live Request

You want to understand the source of latency in the pricing service. Let's generate a request and trace it through the microservice environment.

1.  In the **[Terminal](tab-0)**, use `curl` to send a request to the sample service's endpoint.
    ```run,bash
    curl http://<YOUR_SERVICE_IP>/generate-price
    ```
    *(Note: The actual IP for the service would be provided in a real lab environment.)*

2.  In the **[Datadog](tab-1)** tab, navigate to **APM > Services**.

3.  Click on the **pricing-service** from the service list. You will see performance data for the requests you just generated.

4.  Click on a recent request under the **Traces** tab to view its flame graph. This graph is a visual representation of the request's lifecycle. The width of a span indicates how long it took, and the hierarchy shows which service called which other service.

5.  Examine the flame graph. Where is the most time being spent? Are there any downstream database calls or external API requests that are unexpectedly slow?


Check the traces that are being sent to Datadog in real time. Navigate to **[APM -> Traces](https://app.datadoghq.com/apm/traces?query=env%3Amonitoringk8s)**. Ensure that you have the environment `monitoringk8s` selected:

![List of real time traces](../assets/traces.png)

You will be able to see the traces generated by the traffic in your application flowing into Datadog.

Click on a trace to get an expanded view of that trace in a flame graph visualization:

* ❓ What do you see on that flame graph? What are the tasks that make up most of the latency of that trace?

<details>
<summary>Answer</summary>
<p><span>

On the flame graph you can see that a lot of the latency is made up by spans to render the different frontend views:

![Flame graph](../assets/flame_graph.png)

</span></p>
</details>



By combining metrics, logs, and traces, you now have complete end-to-end visibility into your Kubernetes workloads.

[Summary] End-to-End Visibility in Action
===

Congratulations! You have successfully implemented Datadog on a Kubernetes cluster and used Datadog's core features to gain deep visibility into your infrastructure and applications.

### What You Accomplished

Let's look back at our learning map. You've completed the entire journey from data collection to visualization and investigation.

**✅[K8s Cluster] → ✅[Datadog Agent] → ✅[Metrics / Logs / Traces] → ✅[UI Dashboards]**

You now know how to combine metrics, logs, and traces for end-to-end visibility. With these skills, you can dramatically accelerate troubleshooting and optimization in any Kubernetes environment.

Click the **Next** button at the bottom of this panel. Then, click **Mark Lesson Complete & Continue** to see the course conclusion.