/**  * ENTITY AUTO_GENERATED BY DMT-GENERATOR
 * {{ENTITY_NAME}}
 * DMT 2017
 * GENERATED: 5 / 9 / 2017 - 7:38:21
 **/
var BaseModel = require('../utils/model.js')
var util = require('util')
var Evaluation_request = function () {
	var params = [
		{
			"table":"evaluation_request",
			"relations":[
				{
					"type":"1-1",
					"entity":"user",
					"leftKey":"id_user",
					"name":"user",
					"foreign_name":"email"
				},
				{
					"type":"1-1",
					"entity":"user_answer",
					"leftKey":"id_answer",
					"name":"user_answer",
					"foreign_name":"name"
				},
				{
					"type":"1-1",
					"entity":"question",
					"leftKey":"id_question",
					"name":"question",
					"foreign_name":"name"
				},
				{
					"type":"1-1",
					"entity":"service",
					"leftKey":"id_service",
					"name":"service",
					"foreign_name":"name"
				},
				{
					"type":"1-1",
					"entity":"request_status",
					"leftKey":"id_request_status",
					"name":"status",
					"foreign_name":"name"
				},
				{
					"type":"1-n",
					"entity":"chats",
					"name":"chats",
					"rightKey":"id_evaluation_request"
				}
			],
			"entity":"evaluation_request",
			"model":"entity"
		}
	]
	BaseModel.apply(this, params)
	this.toActivity= function(user,params){
		params = params || {}
		params.limit = params.limit || 20
		params.page = params.page || 1
		params.order = params.order || 'id asc'
		
		let _filters = {}
		for(let i = 0 ; i < params.filter_field.length ; i++){
			if(!_filters[params.filter_field[i]]){
				_filters[params.filter_field[i]] = []
			}
			_filters[params.filter_field[i]].push(params.filter_value[i])
		}

		let query = `SELECT SQL_CALC_FOUND_ROWS * FROM view_evaluation_request 
		WHERE id IN (
			SELECT e_r.id FROM evaluation_request e_r
			JOIN service s ON  e_r.id_service = s.id
			JOIN question q ON  e_r.id_question = q.id
			JOIN questiontopic qt ON  q.id_topic = qt.id
			LEFT JOIN institution i on i.id = s.id_institution
			WHERE 
			${params['institution.id'] ? 's.id_institution = '+params['institution.id'] +' AND ' :''}
			${params['service.id'] ? 's.id = '+params['service.id'] +' AND ' :''}
			${params['region.id'] ? 'i.id_region = '+params['region.id'] +' AND ' :''}
			${params['category.id'] ? 'qt.id_category = '+params['category.id'] +' AND ' :''}
			${params['topic.id'] ? 'qt.id = '+params['topic.id'] +' AND ' :''}
			${params['level'] ? 'q.level = '+params['level'] +' AND ' :''}
			e_r.id_request_status IN (${_filters['id_request_status'].join(',')}) AND 
			e_r.id_user IN (${_filters['id_user'].join(',')}) 
			ORDER BY e_r.${params.order}
		)
		LIMIT ${params.limit * (params.page-1)},${params.limit};
		SELECT FOUND_ROWS() as total;`
		return this.customQuery(query).then((result)=>{
			let data = result[0]
			let total = result[1][0].total
			let list = []
			for (let i = 0; i < data.length; i++) {
				list.push(this.sintetizeRelation(data[i], {entity:'evaluation_request'}))
			}
			return { data: list, total_results: total }
		})
	}
	this.updateTimes = function(atime,ftime,id){
		let q = `UPDATE evaluation_request SET 
			alert_time = '${atime.toISOString().split('T')[0]}', end_time ='${ftime.toISOString().split('T')[0]}'
			WHERE id='${id}'`
		return this.customQuery(q)
	}
	this.addRejection = function(id){
		let q = `UPDATE evaluation_request SET branch = IFNULL(branch,0)+1 WHERE id = '${id}'`
		return this.customQuery(q).then(()=>{
			this.updateView()
		})
	}
	this.getByStatusDate = function(end_time,alert_time,status){
		if(end_time){
			end_time = end_time.toISOString().split('T')[0]
		}
		if(alert_time){
			alert_time = alert_time.toISOString().split('T')[0]
		}
		let q = `SELECT DISTINCT e_r.*,
			c.name category_name, 
			s.name service_name,
			q.level level,
			q.text question,
			qt.name topic,
			u.id user_id,
			u.name user_name,
			i.name institution,
			u.email user_email 
			FROM evaluation_request e_r
			JOIN service s ON e_r.id_service = s.id
			JOIN user u ON u.id = e_r.id_user
			JOIN category c ON c.id = s.id_category
			JOIN question q ON q.id = e_r.id_question
			JOIN questiontopic qt ON qt.id = q.id_topic
			JOIN institution i ON i.id = s.id_institution
			JOIN request_status r_s ON e_r.id_request_status = r_s.id
			WHERE r_s.alert = 1 AND e_r.id_request_status IN (${status.join(',')})
			${end_time ? 'AND DATE(e_r.end_time) = \''+end_time+'\' ':''}
			${alert_time ? 'AND DATE(e_r.alert_time) = \''+alert_time+'\' ':''}`
		return this.customQuery(q)
	}
	return this
};
util.inherits(Evaluation_request, BaseModel)
module.exports = Evaluation_request