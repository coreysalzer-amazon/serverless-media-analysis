package com.budilov.rekognition
//package com.amazonaws.samples

import com.amazonaws.auth.EnvironmentVariableCredentialsProvider
import com.amazonaws.services.rekognition.AmazonRekognitionClient
import com.amazonaws.services.rekognition.model.DetectLabelsRequest
import com.amazonaws.services.rekognition.model.Image
//import com.amazonaws.services.rekognition.model.S3Object

//added by David Ehrlich for TechU Capstone project 1.16.2018
import com.amazonaws.AmazonClientException
import com.amazonaws.auth.AWSCredentials
import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.profile.ProfileCredentialsProvider
//import com.amazonaws.client.builder.AwsClientBuilder.EndpointConfiguration
import com.amazonaws.regions.Regions
import com.amazonaws.services.rekognition.AmazonRekognition
import com.amazonaws.services.rekognition.AmazonRekognitionClientBuilder
import com.amazonaws.services.rekognition.model.CelebrityDetail
import com.amazonaws.services.rekognition.model.CelebrityRecognition
import com.amazonaws.services.rekognition.model.CelebrityRecognitionSortBy
import com.amazonaws.services.rekognition.model.ContentModerationDetection
import com.amazonaws.services.rekognition.model.ContentModerationSortBy
import com.amazonaws.services.rekognition.model.Face
import com.amazonaws.services.rekognition.model.FaceDetection
import com.amazonaws.services.rekognition.model.FaceMatch
import com.amazonaws.services.rekognition.model.GetCelebrityRecognitionRequest
import com.amazonaws.services.rekognition.model.GetCelebrityRecognitionResult
import com.amazonaws.services.rekognition.model.GetContentModerationRequest
import com.amazonaws.services.rekognition.model.GetContentModerationResult
import com.amazonaws.services.rekognition.model.GetFaceDetectionRequest
import com.amazonaws.services.rekognition.model.GetFaceDetectionResult
import com.amazonaws.services.rekognition.model.GetFaceSearchRequest
import com.amazonaws.services.rekognition.model.GetFaceSearchResult
import com.amazonaws.services.rekognition.model.GetLabelDetectionRequest
import com.amazonaws.services.rekognition.model.GetLabelDetectionResult
import com.amazonaws.services.rekognition.model.GetPersonTrackingRequest
import com.amazonaws.services.rekognition.model.GetPersonTrackingResult
import com.amazonaws.services.rekognition.model.LabelDetection
import com.amazonaws.services.rekognition.model.LabelDetectionSortBy
import com.amazonaws.services.rekognition.model.NotificationChannel
import com.amazonaws.services.rekognition.model.PersonDetection
import com.amazonaws.services.rekognition.model.PersonMatch
import com.amazonaws.services.rekognition.model.PersonTrackingSortBy
import com.amazonaws.services.rekognition.model.S3Object

import com.amazonaws.services.rekognition.model.StartCelebrityRecognitionRequest
import com.amazonaws.services.rekognition.model.StartCelebrityRecognitionResult
import com.amazonaws.services.rekognition.model.StartContentModerationRequest
import com.amazonaws.services.rekognition.model.StartContentModerationResult
import com.amazonaws.services.rekognition.model.StartFaceDetectionRequest
import com.amazonaws.services.rekognition.model.StartFaceDetectionResult
import com.amazonaws.services.rekognition.model.StartFaceSearchRequest
import com.amazonaws.services.rekognition.model.StartFaceSearchResult
import com.amazonaws.services.rekognition.model.StartLabelDetectionRequest
import com.amazonaws.services.rekognition.model.StartLabelDetectionResult
import com.amazonaws.services.rekognition.model.StartPersonTrackingRequest
import com.amazonaws.services.rekognition.model.StartPersonTrackingResult
import com.amazonaws.services.rekognition.model.Video
import com.amazonaws.services.rekognition.model.VideoMetadata
import com.amazonaws.services.sns.AmazonSNS
import com.amazonaws.services.sns.AmazonSNSClient
import com.amazonaws.services.sqs.AmazonSQS
import com.amazonaws.services.sqs.AmazonSQSClient
import com.amazonaws.services.sqs.model.Message
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.sql.Time
import java.util.*

import com.budilov.Properties


/**
 * Created by Vladimir Budilov on 11/18/16.
 *
 * The recognition service implementation
 */

class RekognitionService {

    val rekognitionClient = AmazonRekognitionClient(EnvironmentVariableCredentialsProvider())

    //added by David Ehrlich for TechU Capstone 1.16.2018
    val snsClient = AmazonSNSClient(EnvironmentVariableCredentialsProvider())
    val sqsClient = AmazonSQSClient(EnvironmentVariableCredentialsProvider())
    val channel: NotificationChannel = NotificationChannel().withSNSTopicArn("arn:aws:sns:us-east-1:596624219336:AmazonRekognitionCapstonev2").withRoleArn("arn:aws:iam::596624219336:role/RekognitionVideoLabelAnalysis")

    val queueUrl: String = "https://sqs.us-east-1.amazonaws.com/596624219336/RekognitionCapstoneQueue"
    var startJobId: String? = null
    
    /**
     * Returns a list of Rekognition labels for a particular picture in the specified
     * bucket
     */
    fun getLabels(bucketName: String, objectName: String): List<String> {

      //added by David Ehrlich or TechU Capstone 1.17.2018
      StartLabels(bucketName, objectName)
      println("Waiting for job: " + startJobId)
      //Poll queue for messages
      var messages: MutableList<Message>? = null
      var dotLine: Int = 0
      var jobFound: Boolean = false

      //loop until the job status is published. Ignore other messages in queue.
      do{
         //Get messages.
         do{
            messages = sqsClient.receiveMessage(queueUrl).getMessages()
            if (dotLine++<20){
               print(".")
            }else{
               println()
               dotLine=0
            }
         }while(messages!!.isEmpty())

         println()

         //Loop through messages received.
         for (message: Message in messages) {
            val notification: String = message.getBody()

            // Get status and job id from notification.
            val mapper: ObjectMapper = ObjectMapper()
            println("mapper " + mapper)
            println()
            val jsonMessageTree: JsonNode = mapper.readTree(notification)
            println("jsonMessageTree " + jsonMessageTree)
            println("Here Here Here Herer!!!")
            println()
            val messageBodyText: JsonNode = jsonMessageTree.get("Message")
            println("messageBodyText " + messageBodyText)
            println()
            val operationResultMapper: ObjectMapper = ObjectMapper()
            println("operationResultMapper " + operationResultMapper)
            println()
            val jsonResultTree: JsonNode = operationResultMapper.readTree(messageBodyText.textValue())
            println("jsonResultTree " + jsonResultTree)
            println()
            val operationJobId: JsonNode = jsonResultTree.get("JobId")
            println("operationJobId " + operationJobId)
            val operationStatus: JsonNode = jsonResultTree.get("Status")
            println("operationStatus " + operationStatus)
            println()
            println("Job found was " + operationJobId)
            // Found job. Get the results and display.
            if(operationJobId.asText().equals(startJobId)){
               println("I'm inside the if statement for a operationStatus of SUCCEED")
               println()
               jobFound=true
               println("Job id: " + operationJobId )
               println("Status : " + operationStatus.toString())
               if (operationStatus.asText().equals("SUCCEEDED")){
                  //============================================
                    val res = GetResultsLabels()
                  //============================================
                  //val s3Object = S3Object().withBucket(bucketName).withName(objectName)

                    //val req = DetectLabelsRequest()
                    //req.image = Image().withS3Object(s3Object)

                    rekognitionClient.setEndpoint(Properties._REKOGNITION_URL)
                    rekognitionClient.signerRegionOverride = Properties._REGION

                    //val res = rekognitionClient.detectLabels(req)

                    val labels: MutableList<String> = arrayListOf()
                    // Make sure that the confidence level of the label is above our threshold...if so, add it to the map
                    res?.filter { it.getLabel().confidence >= Properties._REKOGNITION_CONFIDENCE_THRESHOLD }
                            ?.mapTo(labels) { it.getLabel().name }

                    sqsClient.deleteMessage(queueUrl,message.getReceiptHandle())
                    
                    return labels
               }
               else{
                  println("Video analysis failed")
               }
               println("Are we ever getting here??")
               sqsClient.deleteMessage(queueUrl,message.getReceiptHandle())
            }

            else{
               println("Job received was not job " +  startJobId)
            }
         }
      } while (!jobFound)
      
      println("Done!")
      
      return arrayListOf() 
    }

    //added by David Ehrlich for TechU Capstone 1.17.2018
    fun StartLabels(bucketName: String, objectName: String) {
        val req = StartLabelDetectionRequest().withVideo(Video()
                  .withS3Object(S3Object()
                        .withBucket(bucketName)
                        .withName(objectName)))
            .withMinConfidence(50F)
            .withJobTag("DetectingLabels")
            .withNotificationChannel(channel)

        val startLabelDetectionResult: StartLabelDetectionResult = rekognitionClient.startLabelDetection(req)
        startJobId = startLabelDetectionResult.getJobId()
        print("startJobId from inside StartLabels() " + startJobId)
        println()
    }

    //added by David Ehrlich for TechU Capstone 1.17.2018
    fun GetResultsLabels(): List<LabelDetection>? {

        val maxResults: Int = 10
        var paginationToken: String? = null
        var labelDetectionResult: GetLabelDetectionResult? = null
        var detectedLabels: List<LabelDetection>? = null
        println("successfully instantiated variables")
        println()

        do {
         if (labelDetectionResult !=null){
            paginationToken = labelDetectionResult.getNextToken()
         }

         println("successfully got pagination token" + paginationToken)

         val labelDetectionRequest: GetLabelDetectionRequest = GetLabelDetectionRequest()
               .withJobId(startJobId)
               .withSortBy(LabelDetectionSortBy.TIMESTAMP)
               .withMaxResults(maxResults)
               .withNextToken(paginationToken)


         labelDetectionResult = rekognitionClient.getLabelDetection(labelDetectionRequest)

         println("successfully assigned labelDetectionRequest" + labelDetectionRequest)

         val videoMetaData: VideoMetadata = labelDetectionResult.getVideoMetadata()

         println("Format: " + videoMetaData.getFormat())
         println("Codec: " + videoMetaData.getCodec())
         println("Duration: " + videoMetaData.getDurationMillis())
         println("FrameRate: " + videoMetaData.getFrameRate())

         println("successfully got videoMetaData" + videoMetaData)


         //Show labels, confidence and detection times
         detectedLabels = labelDetectionResult.getLabels()

         for (detectedLabel: LabelDetection in detectedLabels) {
            val seconds: Long = detectedLabel.getTimestamp()/1000
            //print("Sec: " + Long.toString(seconds) + " ")
            println("\t" + detectedLabel.getLabel().getName() +
                  "     \t" +
                  detectedLabel.getLabel().getConfidence().toString())
            println()
         }
      } while (labelDetectionResult !=null && labelDetectionResult.getNextToken() != null)
      return detectedLabels
    }
}
