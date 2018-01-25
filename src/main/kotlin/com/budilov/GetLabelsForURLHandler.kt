package com.budilov

import com.amazonaws.auth.AnonymousAWSCredentials
import com.amazonaws.regions.Region
import com.amazonaws.regions.Regions
import com.amazonaws.services.cognitoidentity.AmazonCognitoIdentity
import com.amazonaws.services.cognitoidentity.AmazonCognitoIdentityClient
import com.amazonaws.services.cognitoidentity.model.GetIdRequest
import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.budilov.db.ESPictureService
import com.budilov.pojo.ApigatewayRequest
import com.budilov.pojo.PictureItem
import com.budilov.s3.S3Service
import com.google.gson.Gson
import java.util.*


/**
 * Created by Corey Salzer
 *
 * This Lambda function allows clients to search the ElasticSearch index to get labels for a specific photo or video URL.
 *
 * The API Gateway requests need to be signed: https://docs.aws.amazon.com/apigateway/api-reference/signing-requests/
 *
 *
 */

class GetLabelsForURLHandler : RequestHandler<ApigatewayRequest.Input, GetLabelsForURLHandler.SearchResponse> {
    private val esService = ESPictureService()
    private val s3Service = S3Service()
    private val searchKeyName = "search-key"
    private val identityClient: AmazonCognitoIdentity = AmazonCognitoIdentityClient(AnonymousAWSCredentials())

    private val _RESPONSE_EMPTY = "Input parameters weren't there"

    data class SearchResponse(val statusCode: Int,
                              val headers: MutableMap<String, String>?,
                              val body: String)

    data class ResponseBody(val message: String, val labels: List<String>?)

    /**
     * 1. Get the request from API Gateway. Unmarshal (automatically) the request
     * 2. Get the
     */
    override fun handleRequest(request: ApigatewayRequest.Input?, context: Context?): SearchResponse? {

        val logger = context?.logger

        logger?.log("request payload: " + Gson().toJson(request))

        if (request == null || context == null) {
            logger?.log("request or context is null")
        } else {
            val searchString = request.headers?.get(searchKeyName) ?: ""
            val pictureList: List<PictureItem> = esService.search(getCognitoId(request.headers?.get("Authorization") ?: ""), searchString)
            logger?.log("Found pictures: " + pictureList)

            if(pictureList.size == 1) {
              val picture = pictureList[0]
              val labels: List<String>? = picture.labels;
              logger?.log("labels: " + labels)
              val headers: MutableMap<String, String> = HashMap()
              headers.put("Content-Type", "application/json")
              headers.put("Access-Control-Allow-Origin", "*")
              headers.put("Access-Control-Allow-Credentials", "true");
              headers.put("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
              headers.put("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

              return SearchResponse(200, headers, Gson().toJson(ResponseBody("Success", labels)))
            }
        }
        val headers: MutableMap<String, String> = HashMap()
        headers.put("Access-Control-Allow-Origin", "*")
        headers.put("Access-Control-Allow-Credentials", "true");
        headers.put("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        headers.put("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        return SearchResponse(400, headers, """{"message":"$_RESPONSE_EMPTY"}""")
    }

    /**
     * Retrieve the cognito id from the cognito service
     *
     * The result should be cached so as not to call the cognito service for every single request (although I'm not
     * caching it anywhere right now)
     */
    fun getCognitoId(authToken: String): String {
        val idRequest = GetIdRequest()
        idRequest.accountId = Properties._ACCOUNT_NUMBER
        idRequest.identityPoolId = Properties._COGNITO_POOL_ID
        idRequest.logins = mapOf(Pair(Properties._COGNITO_POOL_ID_IDP_NAME, authToken))

        identityClient.setRegion(Region.getRegion(Regions.fromName(Properties._REGION)))
        val idResp = identityClient.getId(idRequest)

        return idResp.identityId ?: ""
    }
}