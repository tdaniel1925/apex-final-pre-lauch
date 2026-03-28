--------------Request to fetch the Advisor details as per the fields provided in Screenshot #1-------------------
					<search>
                    <object>
                    <Agent id = "Agent.5000.1364">
                        <Supervisor>
                        <FirstName/>
                        <LastName/>
                        </Supervisor>
                    <Contact>
                        <FirstName/>
                        <LastName/>
                        <ReferentName/>
                        <Source/>
                        <SubSource/>
                    </Contact>
                    </Agent>
                    </object>
                    </search>
					

----------------Request to fetch the Policy status details as per the fields provided in Screenshot #2---------------------

					<search>
                    <object>
					<Policy>
						<PolicyDate/>
						<PolicyStatus/>
						<PolicyStatusText/>
					<NBHistorys>
					<NBHistory>
						<Status/>
						<StatusDate/>
					</NBHistory>
					</NBHistorys>
					</Policy>
                    </object>
						<condition>
						<expr prop="Policy.PolicyNumber" op="eq">
							<v>1572022</v>
						</expr>
						</condition>                    
					</search>

-------------Request to fetch the Policy List details as per the fields provided in Screenshot #3.----------
					<search>
                        <object>
                            <Policy>
                                <PolicyStatus/>
                                <PolicyStatusText/>
                                <StatusDate/>
                                <CarrierName/>
                                <CommAnnPrem/>
                                <PrimaryAdvisor>
                                    <LastName />
                                    <FirstName />
                                    <Source/>
                                    <SubSource/>
                                </PrimaryAdvisor>
                                <Product>
                                    <Name/>
                                    <InsProduct>
                                        <InsProductType/>
                                        <InsProductTypeText/>
                                    </InsProduct>
                                </Product>
                                <Contact>
                                    <FirstName/>
                                    <LastName/>
                                </Contact>
                            </Policy>
                        </object>
                        <condition>
                            <expr prop="Policy.PolicyNumber" op="eq">
                                <v>343535</v>
                            </expr>
                        </condition>
                    </search>