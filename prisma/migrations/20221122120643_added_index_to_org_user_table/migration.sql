-- CreateIndex
CREATE INDEX "OrgUser_userId_idx" ON "OrgUser"("userId");

-- CreateIndex
CREATE INDEX "OrgUser_organisationId_idx" ON "OrgUser"("organisationId");

-- CreateIndex
CREATE INDEX "OrgUser_orgUserRole_idx" ON "OrgUser"("orgUserRole");
