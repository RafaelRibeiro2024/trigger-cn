module.exports = async function (context, myTimer) {
	const { app } = require('@azure/functions');
	const { CosmosClient } = require('@azure/cosmos');
	
 var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);   
	try {
		const endpoint = "https://project-rrj-database.documents.azure.com:443/";
		const key = process.env.KEYCOSMO;
		
		const databaseId = 'Eventos';
		const containerId = 'Evento';
		context.log(key);
		const client = new CosmosClient({ endpoint, key });
		const database = client.database(databaseId);
		const container = database.container(containerId);

		const currentDate = new Date();

        const { resources: items } = await container.items.readAll().fetchAll();

        for (const item of items) {
            const endDate = new Date(item.end_date);
                
            if (endDate < currentDate) {
                context.log(`A data fim para o item ${item.id} (${item.nome}) passou.`);
				
				// Apagar o item
                await container.item(item.id, item.partitionKey).delete();
                context.log(`Item apagado com sucesso.`);
            }
        }
	
	    } catch (error) {
			console.error('Failed to retrieve Cosmos DB key:', error);
    }
	
    }
};