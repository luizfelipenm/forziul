/**
 * Envia uma mensagem de texto para o seu WhatsApp via Z-API.
 * Usado para te avisar quando um pedido é criado no fornecedor
 * (ou quando dá erro e precisa de atenção manual).
 *
 * Requer as variáveis ZAPI_INSTANCE_ID, ZAPI_TOKEN e ZAPI_CLIENT_TOKEN,
 * além do número de destino em ZAPI_NOTIFICATION_PHONE (formato DDI+DDD+número, ex: 5561999999999).
 */
export async function enviarWhatsApp(mensagem: string): Promise<void> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;
  const telefone = process.env.ZAPI_NOTIFICATION_PHONE;

  if (!instanceId || !token || !telefone) {
    console.warn("Z-API não configurado — pulando notificação de WhatsApp.");
    return;
  }

  try {
    await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clientToken ? { "Client-Token": clientToken } : {}),
        },
        body: JSON.stringify({
          phone: telefone,
          message: mensagem,
        }),
      }
    );
  } catch (err) {
    // Notificação é "best effort" — não deve derrubar o fluxo do pedido
    console.error("Falha ao enviar notificação via Z-API:", err);
  }
}
