import React from 'react'
import BpmnRender from './BpmnRender'

describe('<BpmnRender />', () => {
  // Sample data
  const bpmnXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<bpmn:definitions xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
    "                  xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\"\n" +
    "                  xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\"\n" +
    "                  xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\"\n" +
    "                  xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\"\n" +
    "                  targetNamespace=\"http://example.bpmn.com/schema/bpmn\"\n" +
    "                  xsi:schemaLocation=\"http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd\">\n" +
    "    <bpmn:process id=\"CarRentalProcess\" isExecutable=\"true\">\n" +
    "        <bpmn:startEvent id=\"StartEvent\">\n" +
    "            <bpmn:outgoing>Flow1</bpmn:outgoing>\n" +
    "        </bpmn:startEvent>\n" +
    "        <bpmn:task id=\"CreateOrderForVendor\" name=\"Create order for vendor\">\n" +
    "            <bpmn:incoming>Flow1</bpmn:incoming>\n" +
    "            <bpmn:outgoing>Flow2</bpmn:outgoing>\n" +
    "        </bpmn:task>\n" +
    "        <bpmn:task id=\"NotifyCustomerOfAvailability\" name=\"Notify customer of availability\">\n" +
    "            <bpmn:incoming>Flow2</bpmn:incoming>\n" +
    "            <bpmn:outgoing>Flow3</bpmn:outgoing>\n" +
    "        </bpmn:task>\n" +
    "        <bpmn:task id=\"MakeReservation\" name=\"Make reservation\">\n" +
    "            <bpmn:incoming>Flow3</bpmn:incoming>\n" +
    "            <bpmn:outgoing>Flow4</bpmn:outgoing>\n" +
    "        </bpmn:task>\n" +
    "        <bpmn:task id=\"ProcessCustomerReservation\" name=\"Process customer reservation and payment information\">\n" +
    "            <bpmn:incoming>Flow4</bpmn:incoming>\n" +
    "            <bpmn:outgoing>Flow5</bpmn:outgoing>\n" +
    "        </bpmn:task>\n" +
    "        <bpmn:task id=\"ConfirmRentalAndPayment\" name=\"Confirm rental and payment information\">\n" +
    "            <bpmn:incoming>Flow5</bpmn:incoming>\n" +
    "            <bpmn:outgoing>Flow6</bpmn:outgoing>\n" +
    "        </bpmn:task>\n" +
    "        <bpmn:endEvent id=\"EndEvent\">\n" +
    "            <bpmn:incoming>Flow6</bpmn:incoming>\n" +
    "        </bpmn:endEvent>\n" +
    "        <bpmn:sequenceFlow id=\"Flow1\" sourceRef=\"StartEvent\" targetRef=\"CreateOrderForVendor\"/>\n" +
    "        <bpmn:sequenceFlow id=\"Flow2\" sourceRef=\"CreateOrderForVendor\" targetRef=\"NotifyCustomerOfAvailability\"/>\n" +
    "        <bpmn:sequenceFlow id=\"Flow3\" sourceRef=\"NotifyCustomerOfAvailability\" targetRef=\"MakeReservation\"/>\n" +
    "        <bpmn:sequenceFlow id=\"Flow4\" sourceRef=\"MakeReservation\" targetRef=\"ProcessCustomerReservation\"/>\n" +
    "        <bpmn:sequenceFlow id=\"Flow5\" sourceRef=\"ProcessCustomerReservation\" targetRef=\"ConfirmRentalAndPayment\"/>\n" +
    "        <bpmn:sequenceFlow id=\"Flow6\" sourceRef=\"ConfirmRentalAndPayment\" targetRef=\"EndEvent\"/>\n" +
    "    </bpmn:process>\n" +
    "    <bpmndi:BPMNDiagram id=\"BPMNDiagram_CarRental\">\n" +
    "        <bpmndi:BPMNPlane id=\"BPMNPlane_CarRental\" bpmnElement=\"CarRentalProcess\">\n" +
    "            <bpmndi:BPMNShape id=\"StartEventShape\" bpmnElement=\"StartEvent\">\n" +
    "                <dc:Bounds x=\"100\" y=\"100\" width=\"36\" height=\"36\"/>\n" +
    "            </bpmndi:BPMNShape>\n" +
    "            <bpmndi:BPMNShape id=\"CreateOrderForVendorShape\" bpmnElement=\"CreateOrderForVendor\">\n" +
    "                <dc:Bounds x=\"200\" y=\"80\" width=\"100\" height=\"80\"/>\n" +
    "            </bpmndi:BPMNShape>\n" +
    "            <bpmndi:BPMNShape id=\"NotifyCustomerOfAvailabilityShape\" bpmnElement=\"NotifyCustomerOfAvailability\">\n" +
    "                <dc:Bounds x=\"350\" y=\"80\" width=\"100\" height=\"80\"/>\n" +
    "            </bpmndi:BPMNShape>\n" +
    "            <bpmndi:BPMNShape id=\"MakeReservationShape\" bpmnElement=\"MakeReservation\">\n" +
    "                <dc:Bounds x=\"500\" y=\"80\" width=\"100\" height=\"80\"/>\n" +
    "            </bpmndi:BPMNShape>\n" +
    "            <bpmndi:BPMNShape id=\"ProcessCustomerReservationShape\" bpmnElement=\"ProcessCustomerReservation\">\n" +
    "                <dc:Bounds x=\"650\" y=\"80\" width=\"100\" height=\"80\"/>\n" +
    "            </bpmndi:BPMNShape>\n" +
    "            <bpmndi:BPMNShape id=\"ConfirmRentalAndPaymentShape\" bpmnElement=\"ConfirmRentalAndPayment\">\n" +
    "                <dc:Bounds x=\"800\" y=\"80\" width=\"100\" height=\"80\"/>\n" +
    "            </bpmndi:BPMNShape>\n" +
    "            <bpmndi:BPMNShape id=\"EndEventShape\" bpmnElement=\"EndEvent\">\n" +
    "                <dc:Bounds x=\"950\" y=\"100\" width=\"36\" height=\"36\"/>\n" +
    "            </bpmndi:BPMNShape>\n" +
    "            <bpmndi:BPMNEdge id=\"Flow1Edge\" bpmnElement=\"Flow1\">\n" +
    "                <di:waypoint x=\"136\" y=\"118\"/>\n" +
    "                <di:waypoint x=\"200\" y=\"118\"/>\n" +
    "            </bpmndi:BPMNEdge>\n" +
    "            <bpmndi:BPMNEdge id=\"Flow2Edge\" bpmnElement=\"Flow2\">\n" +
    "                <di:waypoint x=\"300\" y=\"118\"/>\n" +
    "                <di:waypoint x=\"350\" y=\"118\"/>\n" +
    "            </bpmndi:BPMNEdge>\n" +
    "            <bpmndi:BPMNEdge id=\"Flow3Edge\" bpmnElement=\"Flow3\">\n" +
    "                <di:waypoint x=\"450\" y=\"118\"/>\n" +
    "                <di:waypoint x=\"500\" y=\"118\"/>\n" +
    "            </bpmndi:BPMNEdge>\n" +
    "            <bpmndi:BPMNEdge id=\"Flow4Edge\" bpmnElement=\"Flow4\">\n" +
    "                <di:waypoint x=\"600\" y=\"118\"/>\n" +
    "                <di:waypoint x=\"650\" y=\"118\"/>\n" +
    "            </bpmndi:BPMNEdge>\n" +
    "            <bpmndi:BPMNEdge id=\"Flow5Edge\" bpmnElement=\"Flow5\">\n" +
    "                <di:waypoint x=\"750\" y=\"118\"/>\n" +
    "                <di:waypoint x=\"800\" y=\"118\"/>\n" +
    "            </bpmndi:BPMNEdge>\n" +
    "            <bpmndi:BPMNEdge id=\"Flow6Edge\" bpmnElement=\"Flow6\">\n" +
    "                <di:waypoint x=\"900\" y=\"118\"/>\n" +
    "                <di:waypoint x=\"950\" y=\"118\"/>\n" +
    "            </bpmndi:BPMNEdge>\n" +
    "        </bpmndi:BPMNPlane>\n" +
    "    </bpmndi:BPMNDiagram>\n" +
    "</bpmn:definitions>"


  it('renders', () => {
    cy.mount(<BpmnRender bpmnXML={bpmnXML}/>)
  })
})